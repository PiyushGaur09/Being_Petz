import {create} from 'zustand';

const useReplyStore = create(set => ({
  replyTo: null,
  setReplyTo: (message) => set({replyTo: message}),
  clearReplyTo: () => set({replyTo: null}),
}));
export default useReplyStore;
