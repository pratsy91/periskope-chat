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
  setLabel: (label: string) => void;
  addChatUserSearch: string;
  setAddChatUserSearch: (search: string) => void;
  addChatUserResults: any[];
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
  selectedAddChatUsers,
  onSelectAddChatUser,
  onRemoveAddChatUser,
  onCreateAddChat,
  onClose,
  onUserSearch,
}: AddChatModalProps) {
  const [directNameTouched, setDirectNameTouched] = useState(false);

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

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-[#888] hover:text-[#222]"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4">Start a new chat</h2>
        <div className="flex gap-4 mb-4">
          <button
            className={`flex-1 py-2 rounded ${addChatType === 'direct' ? 'bg-[#25d366] text-white' : 'bg-[#f2f2f2] text-[#222]'}`}
            onClick={() => setAddChatType('direct')}
          >
            Direct Chat
          </button>
          <button
            className={`flex-1 py-2 rounded ${addChatType === 'group' ? 'bg-[#25d366] text-white' : 'bg-[#f2f2f2] text-[#222]'}`}
            onClick={() => setAddChatType('group')}
          >
            Group Chat
          </button>
        </div>
        {addChatType === 'group' && (
          <input
            className="w-full max-w-[280px] mx-auto mb-3 px-3 py-2 border border-[#e6e6e6] rounded block"
            placeholder="Group Name"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
          />
        )}
        {addChatType === 'direct' && (
          <input
            className={`w-full max-w-[280px] mx-auto mb-3 px-3 py-2 border ${directNameTouched && directName === '' ? 'border-red-400' : 'border-[#e6e6e6]'} rounded block`}
            placeholder="Direct Chat Name"
            value={directName}
            onChange={e => setDirectName(e.target.value)}
            required
          />
        )}
        <input
          className="w-full max-w-[280px] mx-auto mb-3 px-3 py-2 border border-[#e6e6e6] rounded block"
          placeholder="Label (optional)"
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
        <input
          className="w-full max-w-[280px] mx-auto mb-3 px-3 py-2 border border-[#e6e6e6] rounded block"
          placeholder="Search users..."
          value={addChatUserSearch}
          onChange={handleSearch}
        />
        <div className="max-w-[280px] mx-auto max-h-32 overflow-y-auto mb-3">
          {addChatUserResults.map(user => (
            <div
              key={user.id}
              className={`p-2 cursor-pointer hover:bg-[#f7f8fa] text-sm flex items-center ${selectedAddChatUsers.some(u => u.id === user.id) ? 'bg-[#e7f9ef]' : ''}`}
              onClick={() => onSelectAddChatUser(user)}
            >
              <span className="text-[#25d366] mr-2"><FaUserCircle size={18} /></span>
              {user.username}
            </div>
          ))}
          {!addChatUserResults.length && addChatUserSearch.length > 1 && (
            <div className="p-2 text-xs text-[#888]">No users found</div>
          )}
        </div>
        {addChatType === 'group' && selectedAddChatUsers.length > 0 && (
          <div className="max-w-[280px] mx-auto mb-3 flex flex-wrap gap-2">
            {selectedAddChatUsers.map(user => (
              <span key={user.id} className="bg-[#e7f9ef] text-[#222] px-2 py-1 rounded text-xs flex items-center gap-1">
                {user.username}
                <button className="ml-1 text-[#888]" onClick={() => onRemoveAddChatUser(user.id)}>&times;</button>
              </span>
            ))}
          </div>
        )}
        {addChatType === 'direct' && selectedAddChatUsers[0] && (
          <div className="max-w-[280px] mx-auto mb-3 flex gap-2">
            <span className="bg-[#e7f9ef] text-[#222] px-2 py-1 rounded text-xs flex items-center gap-1">
              {selectedAddChatUsers[0].username}
              <button className="ml-1 text-[#888]" onClick={() => onRemoveAddChatUser(selectedAddChatUsers[0].id)}>&times;</button>
            </span>
          </div>
        )}
        {addChatType === 'group' && (
          <div className="max-w-[280px] mx-auto mb-3">
            <p className="text-xs text-[#888] text-center">
              {selectedAddChatUsers.length === 0 
                ? "Select at least 2 users to create a group chat"
                : selectedAddChatUsers.length === 1 
                ? "Select one more user to create a group chat"
                : !groupName 
                ? "Enter a group name to create the chat"
                : "Ready to create group chat"}
            </p>
          </div>
        )}
        <button
          className="w-full max-w-[280px] mx-auto bg-[#25d366] hover:bg-[#1fa855] text-white py-2 rounded font-semibold mt-2 block disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCreate}
          disabled={addChatType === 'group' ? (selectedAddChatUsers.length < 2 || !groupName) : (selectedAddChatUsers.length !== 1 || !directName)}
        >
          {addChatType === 'group' ? 'Create Group' : 'Start Direct Chat'}
        </button>
        {addChatType === 'direct' && directNameTouched && directName === '' && (
          <div className="text-xs text-red-500 mt-1">Direct chat name is required</div>
        )}
      </div>
    </div>
  );
} 