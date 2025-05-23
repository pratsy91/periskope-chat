import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";

interface AddChatModalProps {
  addChatType: 'direct' | 'group';
  setAddChatType: (type: 'direct' | 'group') => void;
  groupName: string;
  setGroupName: (name: string) => void;
  directName: string;
  setDirectName: (name: string) => void;
  label: string;
  setLabel: (name: string) => void;
  addChatUserSearch: string;
  setAddChatUserSearch: (search: string) => void;
  addChatUserResults: any[];
  setAddChatUserResults: (results: any[]) => void;
  selectedAddChatUsers: any[];
  onSelectAddChatUser: (user: any) => void;
  onRemoveAddChatUser: (userId: string) => void;
  onCreateAddChat: () => void;
  onClose: () => void;
  onUserSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AddChatModal({
  addChatType,
  setAddChatType,
  groupName,
  setGroupName,
  directName,
  setDirectName,
  label,
  setLabel,
  addChatUserSearch,
  setAddChatUserSearch,
  addChatUserResults,
  setAddChatUserResults,
  selectedAddChatUsers,
  onSelectAddChatUser,
  onRemoveAddChatUser,
  onCreateAddChat,
  onClose,
  onUserSearch,
}: AddChatModalProps) {
  const [directNameTouched, setDirectNameTouched] = useState(false);
  const [showDirectChatMessage, setShowDirectChatMessage] = useState(false);

  const isValid = addChatType === 'group' 
    ? selectedAddChatUsers.length >= 2 && groupName.trim() !== ''
    : selectedAddChatUsers.length === 1 && directName.trim() !== '';

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddChatUserSearch(e.target.value);
    onUserSearch(e);
  };

  const handleCreate = () => {
    if (addChatType === 'direct' && directName === '') {
      setDirectNameTouched(true);
      return;
    }
    onCreateAddChat();
    setDirectNameTouched(false);
  };

  const handleSelectUser = (user: any) => {
    if (addChatType === 'direct' && selectedAddChatUsers.length > 0) {
      setShowDirectChatMessage(true);
      // Hide message after 3 seconds
      setTimeout(() => setShowDirectChatMessage(false), 3000);
      return;
    }
    onSelectAddChatUser(user);
    // Clear search results after selection
    setAddChatUserSearch('');
    setAddChatUserResults([]);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-[320px] sm:max-w-md relative">
        <button
          className="absolute top-2 right-2 text-[#888] hover:text-[#222] text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-base sm:text-lg font-bold mb-4">Start a new chat</h2>
        <div className="flex gap-2 sm:gap-4 mb-4">
          <button
            className={`flex-1 py-1.5 sm:py-2 px-2 text-sm sm:text-base rounded ${addChatType === 'direct' ? 'bg-[#25d366] text-white' : 'bg-[#f2f2f2] text-[#222]'}`}
            onClick={() => setAddChatType('direct')}
          >
            Direct Chat
          </button>
          <button
            className={`flex-1 py-1.5 sm:py-2 px-2 text-sm sm:text-base rounded ${addChatType === 'group' ? 'bg-[#25d366] text-white' : 'bg-[#f2f2f2] text-[#222]'}`}
            onClick={() => setAddChatType('group')}
          >
            Group Chat
          </button>
        </div>
        {addChatType === 'group' && (
          <input
            className="w-full mb-3 px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-[#e6e6e6] rounded"
            placeholder="Group Name"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
        )}
        {addChatType === 'direct' && (
          <input
            className={`w-full mb-3 px-3 py-1.5 sm:py-2 text-sm sm:text-base border ${directNameTouched && directName === '' ? 'border-red-400' : 'border-[#e6e6e6]'} rounded`}
            placeholder="Direct Chat Name"
            value={directName}
            onChange={e => setDirectName(e.target.value)}
            required
          />
        )}
        <input
          className="w-full mb-3 px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-[#e6e6e6] rounded"
          placeholder="Label (optional)"
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={addChatUserSearch}
            onChange={onUserSearch}
            className="w-full px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-[#e6e6e6] rounded"
          />
          {addChatUserResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#e6e6e6] rounded shadow-lg max-h-[200px] overflow-y-auto z-10">
              {addChatUserResults.map(user => (
                <div
                  key={user.id}
                  className="p-2 hover:bg-[#f7f8fa] cursor-pointer text-sm flex items-center gap-2"
                  onClick={() => onSelectAddChatUser(user)}
                >
                  <FaUserCircle className="text-[#25d366] text-lg" />
                  <span className="truncate">{user.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedAddChatUsers.length > 0 && (
          <div className="mt-3">
            <div className="text-sm text-[#888] mb-2">Selected users:</div>
            <div className="flex flex-wrap gap-2">
              {selectedAddChatUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-1.5 bg-[#e6f4ea] text-[#04904d] px-2 py-1 rounded-full text-xs sm:text-sm"
                >
                  <span className="truncate">{user.username}</span>
                  <button
                    onClick={() => onRemoveAddChatUser(user.id)}
                    className="text-[#04904d] hover:text-[#037a41]"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={onCreateAddChat}
          disabled={!isValid}
          className={`w-full mt-4 py-2 rounded text-sm sm:text-base font-medium ${
            isValid
              ? 'bg-[#25d366] text-white hover:bg-[#1fa855]'
              : 'bg-[#e6e6e6] text-[#888] cursor-not-allowed'
          }`}
        >
          Create Chat
        </button>
      </div>
    </div>
  );
} 