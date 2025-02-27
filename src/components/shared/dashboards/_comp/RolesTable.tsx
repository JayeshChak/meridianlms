import React, { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import useSweetAlert from "@/hooks/useSweetAlert";
import DotLoader from "@/components/sections/create-course/_comp/Icons/DotLoader";
import Modal from "./Modal";
import VerifiedSymbol from "./VerifiedIcon";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import UserTableSkeleton from "./skeleton/UserTable";
import { formatDate } from "@/actions/formatDate";
import { User, UserTableProps } from "@/types/type";
import UserDetailsCustom from "./UserDetailsCustom";
import ErrorBoundary from "./ErrorBoundary";

const UserTable: React.FC<UserTableProps> = ({
	users,
	setUsers,
	isLoading,
}) => {
	const { data: session } = useSession() as { data: Session | null };
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [showModal, setShowModal] = useState<boolean>(false);
	const [emailInput, setEmailInput] = useState<string>("");
	const [loading, setLoading] = useState<string | null>(null);
	const [modalType, setModalType] = useState<
		"deleteUser" | "inviteAdmin" | "viewUser"
	>("inviteAdmin");
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
	const showAlert = useSweetAlert();
	const dropdownRef = useRef<HTMLDivElement | null>(null);

	// Ensure that the filtered users list updates when the users prop changes
	useEffect(() => {
		setFilteredUsers(users);
	}, [users]);

	// Attach and clean up the click outside Event listener once when the component mounts
	useEffect(() => {
		const handleClickOutside = (Event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(Event.target as Node)
			) {
				setSelectedUserId(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Debounced search function to improve performance
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedSearch = useCallback(
		debounce((query: string) => {
			if (query.trim() === "") {
				setFilteredUsers(users);
			} else {
				const lowerCaseQuery = query.toLowerCase();
				const filtered = users.filter((User) =>
					User.unique_identifier
						? User.unique_identifier
								.toLowerCase()
								.includes(lowerCaseQuery) ||
						  User.name.toLowerCase().includes(lowerCaseQuery) ||
						  User.email.toLowerCase().includes(lowerCaseQuery) ||
						  User.username.toLowerCase().includes(lowerCaseQuery)
						: false
				);
				setFilteredUsers(filtered);
			}
		}, 300),
		[users]
	);

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setSearchQuery(query);
		debouncedSearch(query);
	};

	if (isLoading) {
		return <UserTableSkeleton />;
	}

	const handleDropdownToggle = (user_id: string) => {
		setSelectedUserId((prevSelectedUserId) =>
			prevSelectedUserId === user_id ? null : user_id
		);
	};

	const viewUserDetails = (user_id: string) => {
		setSelectedUserId(user_id);
		setModalType("viewUser");
		setShowModal(true);
	};
	const handleAction = (
		user_id: string,
		action: string,
		currentRoles: string[]
	) => {
		setSelectedUserId(null); // Close the dropdown after action

		if (action === "makeAdmin" && !currentRoles.includes("admin")) {
			updateUserRole(user_id, "admin");
		} else if (
			action === "makeInstructor" &&
			!currentRoles.includes("instructor")
		) {
			updateUserRole(user_id, "instructor");
		} else if (
			action === "makeUser" &&
			(currentRoles.includes("admin") ||
				currentRoles.includes("instructor"))
		) {
			updateUserRole(user_id, "User");
		} else if (action === "deleteUser") {
			setShowModal(true); // Open the modal for deletion
			setModalType("deleteUser"); // Set modal type to delete
			setSelectedUserId(user_id); // Track which User to delete
		}
	};

	const renderActions = (User: User, currentUserRoles: string[]) => {
		if (currentUserRoles.includes("superAdmin")) {
			return (
				<>
					{/* SuperAdmin: Full access */}
					{User.roles.includes("User") && (
						<>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeInstructor",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make Instructor
							</button>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeAdmin",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make Admin
							</button>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"deleteUser",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Delete User
							</button>
						</>
					)}
					{User.roles.includes("instructor") && (
						<>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeAdmin",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make Admin
							</button>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeUser",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make User
							</button>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"deleteUser",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Delete Instructor
							</button>
						</>
					)}
					{User.roles.includes("admin") && (
						<>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeInstructor",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make Instructor
							</button>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeUser",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make User
							</button>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"deleteUser",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Delete Admin
							</button>
						</>
					)}
				</>
			);
		}

		// Admin: Limited access (can delete if allowed)
		if (currentUserRoles.includes("admin")) {
			return (
				<>
					{/* Dropdown for users with the role 'User' */}
					{User.roles.includes("User") && (
						<>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeInstructor",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make Instructor
							</button>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeAdmin",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make Admin
							</button>
						</>
					)}

					{/* Dropdown for users with the role 'instructor' */}
					{User.roles.includes("instructor") && (
						<>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeUser",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make User
							</button>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeAdmin",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make Admin
							</button>
						</>
					)}

					{/* Dropdown for users with the role 'admin' */}
					{User.roles.includes("admin") && (
						<>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeInstructor",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make Instructor
							</button>
							<button
								onClick={() =>
									handleAction(
										User.id,
										"makeUser",
										User.roles
									)
								}
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
							>
								Make User
							</button>
						</>
					)}
				</>
			);
		}

		return null;
	};

	const updateUserRole = async (user_id: string, newRole: string) => {
		setLoading(user_id);
		try {
			const response = await fetch(`/api/User/${user_id}/role`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role: newRole }),
			});

			if (!response.ok) throw new Error("Failed to update the role");

			const updatedUser = await response.json();
			setUsers((prevUsers) =>
				prevUsers.map((User) =>
					User.id === user_id
						? { ...User, roles: updatedUser.updatedUser.roles }
						: User
				)
			);
			showAlert("success", `Role updated to ${newRole}`);
		} catch (error: any) {
			showAlert("error", error.message || "Failed to update the role");
		} finally {
			setLoading(null);
		}
	};

	const deleteUser = async (user_id: string) => {
		setLoading(user_id);

		if (!user_id) {
			showAlert("error", "Invalid User ID");
			return;
		}

		try {
			const response = await fetch(`/api/User/${user_id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete the User");

			setUsers((prevUsers) =>
				prevUsers.filter((User) => User.id !== user_id)
			);
			showAlert("success", "User deleted successfully");
			setShowModal(false);
		} catch (error: any) {
			showAlert("error", error.message || "Failed to delete the User");
		} finally {
			setLoading(null);
		}
	};

	const inviteAdminByEmail = async () => {
		try {
			const response = await fetch(`/api/User/invite-admin`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: emailInput }),
			});

			if (!response.ok) throw new Error("Failed to invite admin");

			showAlert("success", `Invitation sent to ${emailInput}`);
			setShowModal(false);
			setEmailInput("");
		} catch (error: any) {
			showAlert("error", error.message || "Failed to send invitation");
		}
	};

	return (
		<div className="overflow-x-auto pb-[130px] shadow-sm rounded-md relative">
			<div className="flex justify-start p-4">
				<input
					type="text"
					value={searchQuery}
					onChange={handleSearchChange}
					placeholder="Search by Unique ID, Name, or Username..."
					className="border text-sm border-gray-300 rounded-md p-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue"
				/>
			</div>
			<table className="min-w-full ">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
							# ID
						</th>
						<th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
							Name
						</th>
						<th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
							No. of Courses
						</th>
						<th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
							Join At
						</th>
						<th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
							Role
						</th>
						<th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y  divide-gray-200">
					{filteredUsers.map((User) => (
						<tr key={User.id}>
							<td
								className="px-6 py-4 whitespace-nowrap text-sm text-blue cursor-pointer hover:underline"
								onClick={() => viewUserDetails(User.id)}
							>
								{User.unique_identifier || "N/A"}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
								{User.name}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
								{User.enrolledCoursesCount || 0}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
								{formatDate(User.created_at)}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
								{User.roles.join(", ")}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
								<div className="relative inline-block text-left">
									{loading === User.id ? (
										<DotLoader className="h-2 w-2" />
									) : User.roles.includes("superAdmin") ? (
										<VerifiedSymbol className="h-6 w-6" />
									) : (
										<>
											<button
												onClick={() =>
													handleDropdownToggle(
														User.id
													)
												}
												className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue text-sm font-medium text-white hover:bg-blueDark focus:outline-none focus:ring-2 focus:ring-blue"
											>
												...
											</button>
											{selectedUserId === User.id && (
												<div
													ref={dropdownRef}
													className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
												>
													<div className="py-1">
														{renderActions(
															User,
															session?.User
																?.roles || []
														)}
													</div>
												</div>
											)}
										</>
									)}
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{showModal && (
				<Modal
					is_visible={showModal}
					onClose={() => setShowModal(false)}
					title={
						modalType === "inviteAdmin"
							? "Add Admin via Email"
							: modalType === "deleteUser"
							? "Confirm Delete"
							: "User Details"
					}
					content={
						<ErrorBoundary>
							{modalType === "inviteAdmin" ? (
								<input
									type="email"
									value={emailInput}
									onChange={(e) =>
										setEmailInput(e.target.value)
									}
									className="border border-gray-300 rounded-md p-2 w-full"
									placeholder="Enter email"
								/>
							) : modalType === "deleteUser" ? (
								<p className="text-red-500">
									Are you sure you want to delete this User?
									This action cannot be undone.
								</p>
							) : (
								<UserDetailsCustom user_id={selectedUserId!} />
							)}
						</ErrorBoundary>
					}
					confirmText={
						modalType === "inviteAdmin"
							? "Send Invitation"
							: modalType === "deleteUser"
							? "Yes, Delete"
							: "Close"
					}
					onConfirm={
						modalType === "inviteAdmin"
							? inviteAdminByEmail
							: modalType === "deleteUser"
							? () => deleteUser(selectedUserId!)
							: () => setShowModal(false)
					}
					cancelText={
						modalType === "inviteAdmin" ||
						modalType === "deleteUser"
							? "Cancel"
							: undefined
					}
					size={
						modalType === "inviteAdmin"
							? "sm"
							: modalType === "deleteUser"
							? "lg"
							: "xl"
					} // Assign 'xl' for 'viewUser'
					customClasses={
						modalType === "deleteUser" ? "bg-red-500" : ""
					}
				/>
			)}
		</div>
	);
};

export default UserTable;

// // components/shared/dashboards/_comp/UserTable.tsx

// import React, { useState, useEffect, useCallback } from "react";
// import debounce from "lodash.debounce"; // Ensure correct import
// import useSweetAlert from "@/hooks/useSweetAlert";
// import DotLoader from "@/components/sections/create-course/_comp/Icons/DotLoader";
// import Modal from "./Modal"; // Ensure Modal is correctly imported
// import VerifiedSymbol from "./VerifiedIcon";
// import { useSession } from "next-auth/react";
// import { Session } from "next-auth";
// import UserTableSkeleton from "./skeleton/UserTable";
// import { formatDate } from "@/actions/formatDate";
// import { User, UserTableProps } from "@/types/type"; // Ensure correct import
// import UserDetailsCustom from "./UserDetailsCustom"; // Newly created component

// const UserTable: React.FC<UserTableProps> = ({
//   users,
//   setUsers,
//   isLoading,
// }) => {
//   const { data: session } = useSession() as { data: Session | null };
//   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
//   const [showModal, setShowModal] = useState<boolean>(false); // Modal state
//   const [emailInput, setEmailInput] = useState<string>(""); // Email input state for invite
//   const [loading, setLoading] = useState<string | null>(null); // Track loading state for each User
//   const [modalType, setModalType] = useState<
//     "deleteUser" | "inviteAdmin" | "viewUser"
//   >("inviteAdmin"); // Track the modal type
//   const [searchQuery, setSearchQuery] = useState<string>(""); // Search query state
//   const [filteredUsers, setFilteredUsers] = useState<User[]>(users); // Filtered users based on search
//   const showAlert = useSweetAlert();

//   useEffect(() => {
//     setFilteredUsers(users);
//   }, [users]);

//   // Debounced search to improve performance
//   const debouncedSearch = useCallback(
//     debounce((query: string) => {
//       if (query.trim() === "") {
//         setFilteredUsers(users);
//       } else {
//         const lowerCaseQuery = query.toLowerCase();
//         const filtered = users.filter((User) =>
//           User.unique_identifier
//             ? User.unique_identifier.toLowerCase().includes(lowerCaseQuery) ||
//               User.name.toLowerCase().includes(lowerCaseQuery) ||
//               User.email.toLowerCase().includes(lowerCaseQuery) ||
//               User.username.toLowerCase().includes(lowerCaseQuery)
//             : false
//         );
//         setFilteredUsers(filtered);
//       }
//     }, 300),
//     [users]
//   );

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setSearchQuery(query);
//     debouncedSearch(query);
//   };

//   if (isLoading) {
//     return <UserTableSkeleton />;
//   }

//   const handleDropdownToggle = (user_id: string) => {
//     setSelectedUserId((prevSelectedUserId) =>
//       prevSelectedUserId === user_id ? null : user_id
//     );
//   };

//   // Function to update the User's role
//   const updateUserRole = async (user_id: string, newRole: string) => {
//     setLoading(user_id); // Set loading state for this User
//     try {
//       const response = await fetch(`/api/User/${user_id}/role`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ role: newRole }), // Send a single role as an object
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to update the role");
//       }

//       const updatedUser = await response.json();

//       // Update the users state with the updated User roles
//       setUsers((prevUsers) =>
//         prevUsers.map((User) =>
//           User.id === user_id
//             ? { ...User, roles: updatedUser.updatedUser.roles }
//             : User
//         )
//       );

//       showAlert("success", `Role updated to ${newRole}`);
//     } catch (error: any) {
//       console.error(error);
//       showAlert("error", error.message || "Failed to update the role");
//     } finally {
//       setLoading(null); // Reset loading state
//     }
//   };

//   // Function to delete a User
//   const deleteUser = async (user_id: string) => {
//     setLoading(user_id); // Set loading state for this User
//     try {
//       const response = await fetch(`/api/User/${user_id}`, {
//         method: "DELETE",
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to delete the User");
//       }

//       // Remove the deleted User from the state
//       setUsers((prevUsers) => prevUsers.filter((User) => User.id !== user_id));
//       showAlert("success", "User deleted successfully");
//       setShowModal(false);
//     } catch (error: any) {
//       console.error(error);
//       showAlert("error", error.message || "Failed to delete the User");
//     } finally {
//       setLoading(null); // Reset loading state
//     }
//   };

//   // Function to invite admin via email (labeled as "Add via Email")
//   const inviteAdminByEmail = async () => {
//     try {
//       const response = await fetch(`/api/User/invite-admin`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email: emailInput }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to invite admin");
//       }

//       showAlert("success", `Invitation sent to ${emailInput}`);
//       setShowModal(false);
//       setEmailInput("");
//     } catch (error: any) {
//       console.error(error);
//       showAlert("error", error.message || "Failed to send invitation");
//     }
//   };

//   // Function to view User details
//   const viewUserDetails = (user_id: string) => {
//     setSelectedUserId(user_id);
//     setModalType("viewUser");
//     setShowModal(true);
//   };

//   // Define the handleAction function
// const handleAction = (
//   user_id: string,
//   action: string,
//   currentRoles: string[]
// ) => {
//   setSelectedUserId(null); // Close the dropdown after action

//   if (action === "makeAdmin" && !currentRoles.includes("admin")) {
//     updateUserRole(user_id, "admin");
//   } else if (
//     action === "makeInstructor" &&
//     !currentRoles.includes("instructor")
//   ) {
//     updateUserRole(user_id, "instructor");
//   } else if (
//     action === "makeUser" &&
//     (currentRoles.includes("admin") || currentRoles.includes("instructor"))
//   ) {
//     updateUserRole(user_id, "User");
//   } else if (action === "deleteUser") {
//     setShowModal(true); // Open the modal for deletion
//     setModalType("deleteUser"); // Set modal type to delete
//     setSelectedUserId(user_id); // Track which User to delete
//   }
// };

// const renderActions = (User: User, currentUserRoles: string[]) => {
//   if (currentUserRoles.includes("superAdmin")) {
//     return (
//       <>
//         {/* SuperAdmin: Full access */}
//         {User.roles.includes("User") && (
//           <>
//             <button
//               onClick={() =>
//                 handleAction(User.id, "makeInstructor", User.roles)
//               }
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make Instructor
//             </button>
//             <button
//               onClick={() => handleAction(User.id, "makeAdmin", User.roles)}
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make Admin
//             </button>
//             <button
//               onClick={() => handleAction(User.id, "deleteUser", User.roles)}
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Delete User
//             </button>
//           </>
//         )}
//         {User.roles.includes("instructor") && (
//           <>
//             <button
//               onClick={() => handleAction(User.id, "makeAdmin", User.roles)}
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make Admin
//             </button>
//             <button
//               onClick={() => handleAction(User.id, "makeUser", User.roles)}
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make User
//             </button>
//             <button
//               onClick={() => handleAction(User.id, "deleteUser", User.roles)}
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Delete Instructor
//             </button>
//           </>
//         )}
//         {User.roles.includes("admin") && (
//           <>
//             <button
//               onClick={() =>
//                 handleAction(User.id, "makeInstructor", User.roles)
//               }
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make Instructor
//             </button>
//             <button
//               onClick={() => handleAction(User.id, "makeUser", User.roles)}
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make User
//             </button>
//             <button
//               onClick={() => handleAction(User.id, "deleteUser", User.roles)}
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Delete Admin
//             </button>
//           </>
//         )}
//       </>
//     );
//   }

//   // Admin: Limited access (can delete if allowed)
//   if (currentUserRoles.includes("admin")) {
//     return (
//       <>
//         {/* Dropdown for users with the role 'User' */}
//         {User.roles.includes("User") && (
//           <>
//             <button
//               onClick={() =>
//                 handleAction(User.id, "makeInstructor", User.roles)
//               }
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make Instructor
//             </button>
//             <button
//               onClick={() => handleAction(User.id, "makeAdmin", User.roles)}
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make Admin
//             </button>
//           </>
//         )}

//         {/* Dropdown for users with the role 'instructor' */}
//         {User.roles.includes("instructor") && (
//           <>
//             <button
//               onClick={() => handleAction(User.id, "makeUser", User.roles)}
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make User
//             </button>
//             <button
//               onClick={() => handleAction(User.id, "makeAdmin", User.roles)}
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make Admin
//             </button>
//           </>
//         )}

//         {/* Dropdown for users with the role 'admin' */}
//         {User.roles.includes("admin") && (
//           <>
//             <button
//               onClick={() =>
//                 handleAction(User.id, "makeInstructor", User.roles)
//               }
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make Instructor
//             </button>
//             <button
//               onClick={() => handleAction(User.id, "makeUser", User.roles)}
//               className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
//             >
//               Make User
//             </button>
//           </>
//         )}
//       </>
//     );
//   }

//   return null;
// };

//   // Helper function to render social links within UserDetails
//   // (Assuming it's not needed here as it's handled within UserDetails)

//   return (
//     <div className="overflow-x-auto shadow-sm rounded-md">
//       {/* Search Bar */}
//       <div className="flex justify-start p-4">
//         <input
//           type="text"
//           value={searchQuery}
//           onChange={handleSearchChange}
//           placeholder="Search by Unique ID, Name, or Username..."
//           className="border text-sm border-gray-300 rounded-md p-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue/75"
//         />
//       </div>

//       <table className="min-w-full">
//         <thead className="bg-gray-50 ">
//           <tr>
//             <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
//               # ID
//             </th>
//             <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
//               Name
//             </th>

//             <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
//               No. of Courses
//             </th>
//             <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
//               Join At
//             </th>
//             <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
//               Role
//             </th>
//             <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">
//               Actions
//             </th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-200">
//           {filteredUsers.length > 0 ? (
//             filteredUsers.map((User) => {
//               const roles = User.roles.includes("superAdmin")
//                 ? ["superAdmin"]
//                 : User.roles;

//               return (
//                 <tr key={User.id}>
//                   <td
//                     className="px-6 py-4 whitespace-nowrap text-sm text-blue cursor-pointer hover:underline"
//                     onClick={() => viewUserDetails(User.id)}
//                   >
//                     {User.unique_identifier || "N/A"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
//                     {User.name}
//                   </td>

//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
//                     {User.enrolledCoursesCount ? User.enrolledCoursesCount : 0}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
//                     {formatDate(User.created_at)}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
//                     {roles.join(", ")}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
//                     <div className="relative inline-block text-left">
//                       {roles.includes("superAdmin") ? (
//                         <VerifiedSymbol className="h-6 w-6" />
//                       ) : loading === User.id ? (
//                         <DotLoader className="h-2 w-2" />
//                       ) : (
//                         <>
//                           <button
//                             type="button"
//                             onClick={() => handleDropdownToggle(User.id)}
//                             className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue/75"
//                           >
//                             ...
//                           </button>

//                           {selectedUserId === User.id && (
//                             <div className="origin-top-right z-[9999] absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
//                               <div className="py-1">
//                                 {renderActions(
//                                   User,
//                                   session?.User?.roles || []
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })
//           ) : (
//             <tr>
//               <td
//                 colSpan={7}
//                 className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
//               >
//                 No users found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* Modal for adding an admin via email, confirming delete, or viewing User details */}
//       {showModal && (
//         <Modal
//           is_visible={showModal}
//           onClose={() => setShowModal(false)}
//           title={
//             modalType === "inviteAdmin"
//               ? "Add Admin via Email"
//               : modalType === "deleteUser"
//               ? "Confirm Delete"
//               : "User Details"
//           }
//           content={
//             modalType === "inviteAdmin" ? (
//               <input
//                 type="email"
//                 value={emailInput}
//                 onChange={(e) => setEmailInput(e.target.value)}
//                 className="border border-gray-300 rounded-md p-2 w-full"
//                 placeholder="Enter email"
//               />
//             ) : modalType === "deleteUser" ? (
//               "This action cannot be undone."
//             ) : modalType === "viewUser" ? (
//               <UserDetailsCustom user_id={selectedUserId!} /> // Non-null assertion since user_id is set
//             ) : null
//           }
//           confirmText={
//             modalType === "inviteAdmin"
//               ? "Send Invitation"
//               : modalType === "deleteUser"
//               ? "Yes, Delete"
//               : "Close"
//           }
//           cancelText={modalType !== "viewUser" ? "Cancel" : undefined}
//           onConfirm={
//             modalType === "inviteAdmin"
//               ? inviteAdminByEmail
//               : modalType === "deleteUser"
//               ? () => deleteUser(selectedUserId!)
//               : () => setShowModal(false)
//           }
//           onCancel={
//             modalType !== "viewUser" ? () => setShowModal(false) : undefined
//           }
//         />
//       )}
//     </div>
//   );
// };

// export default UserTable;
