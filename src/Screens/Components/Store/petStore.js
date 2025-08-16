import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const usePetStore = create((set) => ({
  selectedPetId: null,
  myPets: [],
  loadingPets: false,
  setSelectedPetId: async (id) => {
    set({ selectedPetId: id });
    try {
      await AsyncStorage.setItem('SelectedPetId', id.toString());
    } catch (e) {
      console.error('Error saving selected pet ID:', e);
    }
  },
  setMyPets: (pets) => set({ myPets: pets }),
  setLoadingPets: (loading) => set({ loadingPets: loading }),
  currentPet: () => {
    const { myPets, selectedPetId } = usePetStore.getState();
    return myPets.find(pet => pet.id === selectedPetId) || null;
  },
  fetchPetDetails: async (userId) => {
    set({ loadingPets: true });
    try {
      const storedPetId = await AsyncStorage.getItem('SelectedPetId');

      const formData = new FormData();
      formData.append('user_id', userId);

      const response = await fetch(
        'https://argosmob.com/being-petz/public/api/v1/pet/get/my',
        {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        },
      );

      const data = await response.json();
      const pets = data?.data || [];
      
      set({ myPets: pets });

      if (storedPetId && pets.some(p => p.id === parseInt(storedPetId))) {
        set({ selectedPetId: parseInt(storedPetId) });
      } else if (pets.length > 0) {
        set({ selectedPetId: pets[0].id });
        await AsyncStorage.setItem('SelectedPetId', pets[0].id.toString());
      }
    } catch (error) {
      console.error('Fetch error:', error.message);
    } finally {
      set({ loadingPets: false });
    }
  },
}));

export default usePetStore;