import { supabase } from "../hooks/useChats";

interface AddChatOperationsProps {
  userId: string | null;
  addChatType: 'direct' | 'group';
  groupName: string;
  directName: string;
  label: string;
  selectedAddChatUsers: any[];
  refreshChats: () => void;
  setSelectedChat: (chatId: string | null) => void;
  setShowAddChatModal: (show: boolean) => void;
  setAddChatUserSearch: (search: string) => void;
  setAddChatUserResults: (results: any[]) => void;
  setSelectedAddChatUsers: (users: any[]) => void;
  setGroupName: (name: string) => void;
  setDirectName: (name: string) => void;
  setLabel: (label: string) => void;
}

export async function handleCreateAddChat({
  userId,
  addChatType,
  groupName,
  directName,
  label,
  selectedAddChatUsers,
  refreshChats,
  setSelectedChat,
  setShowAddChatModal,
  setAddChatUserSearch,
  setAddChatUserResults,
  setSelectedAddChatUsers,
  setGroupName,
  setDirectName,
  setLabel,
}: AddChatOperationsProps) {
  if (addChatType === 'group') {
    if (selectedAddChatUsers.length < 2 || !groupName) {
      console.log('Cannot create group chat:', { selectedUsers: selectedAddChatUsers.length, groupName });
      return;
    }
    console.log('Creating group chat:', { groupName, selectedUsers: selectedAddChatUsers });
    
    // Create a new group chat
    const { data: newChat, error: chatError } = await supabase
      .from("chats")
      .insert([{ name: groupName }])
      .select("id")
      .single();

    if (chatError || !newChat) {
      console.error("Error creating chat:", chatError);
      alert("Failed to create group chat.");
      return;
    }

    console.log('Created new chat:', newChat);

    // Add label if provided
    let labelId = null;
    if (label && label.trim() !== "") {
      const { data: labelData, error: labelError } = await supabase
        .from("labels")
        .upsert([{ name: label.trim() }])
        .select("id")
        .single();
      if (!labelError && labelData) {
        labelId = labelData.id;
      }
    }
    if (labelId) {
      await supabase.from("chat_labels").insert([
        { chat_id: newChat.id, label_id: labelId }
      ]);
    }

    // Add all selected users and current user to chat_members
    const memberIds = [userId, ...selectedAddChatUsers.map(u => u.id)];
    const { error: memberError } = await supabase.from("chat_members").insert(
      memberIds.map(uid => ({ chat_id: newChat.id, user_id: uid }))
    );

    if (memberError) {
      console.error("Error adding members:", memberError);
      alert("Failed to add members to group chat.");
      return;
    }

    console.log('Added members to chat:', memberIds);

    // Update UI
    setSelectedChat(newChat.id);
    setShowAddChatModal(false);
    setAddChatUserSearch("");
    setAddChatUserResults([]);
    setSelectedAddChatUsers([]);
    setGroupName("");
    setLabel(""); // Clear label after creation
    refreshChats();
  }
}

export async function handleAddChatUserSearch(
  userId: string | null,
  value: string,
  setAddChatUserSearch: (search: string) => void,
  setAddChatUserResults: (results: any[]) => void
) {
  setAddChatUserSearch(value);
  if (value.length < 2) {
    setAddChatUserResults([]);
    return;
  }
  const { data, error } = await supabase
    .from("users")
    .select("id, username")
    .ilike("username", `%${value}%`)
    .neq("id", userId);
  setAddChatUserResults(data || []);
}

export function handleSelectAddChatUser(
  user: any,
  selectedAddChatUsers: any[],
  setSelectedAddChatUsers: (users: any[]) => void
) {
  if (selectedAddChatUsers.some(u => u.id === user.id)) {
    setSelectedAddChatUsers(selectedAddChatUsers.filter(u => u.id !== user.id));
  } else {
    setSelectedAddChatUsers([...selectedAddChatUsers, user]);
  }
}

export function handleRemoveAddChatUser(
  userId: string,
  selectedAddChatUsers: any[],
  setSelectedAddChatUsers: (users: any[]) => void
) {
  setSelectedAddChatUsers(selectedAddChatUsers.filter(u => u.id !== userId));
} 