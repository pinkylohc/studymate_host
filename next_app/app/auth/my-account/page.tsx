import { auth } from "@/auth";
import SideBar from "@/components/side_bar/sidebar";
import { checkUserLink } from "@/db/user";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { HiOutlineUser } from "react-icons/hi";
import { DeleteAccountButton } from "@/components/account_buttons";
import UpdateAccountForm from "@/components/auth/update_account_form";

const MyAccountPage = async () => {
  const session = await auth();
  let provider: string[] | null = null;

  if (session?.user?.id) {
    provider = await checkUserLink(session.user.id.toString());
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <SideBar>
        <div className="flex flex-col w-full p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <HiOutlineUser className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            </div>
            <p className="text-gray-600 text-lg">Manage your account settings and linked services.</p>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-xl bg-white rounded-2xl p-8 border border-gray-200/75 shadow-lg space-y-8 backdrop-blur-sm backdrop-saturate-150">
              {provider ? (
                <div className="flex flex-col space-y-8">
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-gray-700 mb-2 sm:mb-0">Linked Accounts</span>
                      <div className="flex items-center space-x-4">
                        {provider.includes('google') && (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                            <FcGoogle className="h-5 w-5" />
                            <span>Google</span>
                          </div>
                        )}
                        {provider.includes('github') && (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                            <FaGithub className="h-5 w-5" />
                            <span>GitHub</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="block text-sm font-medium text-gray-500">Name</span>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">{session?.user?.name}</div>
                    </div>
                    <div className="space-y-2">
                      <span className="block text-sm font-medium text-gray-500">Email</span>
                      <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-700">{session?.user?.email}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  <UpdateAccountForm 
                    userId={session?.user?.id || ''}
                    initialUsername={session?.user?.name || ''}
                    initialEmail={session?.user?.email || ''} 
                  />
                </div>
              )}

              {session?.user?.id && (
                <div className="pt-4 border-t border-gray-200">
                  <DeleteAccountButton userId={session.user.id.toString()} />
                </div>
              )}
            </div>
          </div>
        </div>
      </SideBar>
    </div>
  );
};

export default MyAccountPage;