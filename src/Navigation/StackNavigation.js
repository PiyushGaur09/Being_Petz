// import {
//   createNativeStackNavigator,
//   CardStyleInterpolators,
// } from '@react-navigation/native-stack';
// import Splash from '../Screens/Splash';
// import {NavigationContainer} from '@react-navigation/native';
// import Login from '../Screens/Login';
// import OTP from '../Screens/OTP';
// import PetParentForm from '../Screens/PetParentForm';
// import PetForm from '../Screens/PetForm';
// import Home from '../Screens/Home';
// import BottomNavigation from './BottomNavigation';
// import BottomTabNavigator from './BottomNavigation';
// import ChatScreen from '../Screens/ChatScreen';
// import AdoptPet from '../Screens/AdoptPet';
// import GiveForAdoption from '../Screens/GiveForAdoption';
// import GiveForAdoption2 from '../Screens/GiveForAdoption2';
// import LostPet from '../Screens/LostPet';
// import LostPetDetail from '../Screens/LostPetDetail';
// import PetsDetail from '../Screens/LostPetDetail';
// import Signup from '../Screens/Signup';
// import Chats from '../Screens/Chats';
// import IndividualChats from '../Screens/IndividualChats';
// import Add from '../Screens/Add';
// import Splash2 from '../Screens/Splash2';
// import EditPetInfo from '../Screens/EditPetInfo';
// import AddPets from '../Screens/AddPets';
// import CreateCommunity from '../Screens/CreateCommunity';
// import MyPosts from '../Screens/MyPosts';
// import ViewAll from '../Screens/ViewAll';
// import EditRecordScreen from '../Screens/Components/EditRecordScreen';
// import AddLostAndFound from '../Screens/AddLostAndFound';
// import ServicesDescription from '../Screens/Components/ServicesDescription';
// import RecoverPassword from '../Screens/RecoverPassword';
// import ResetPassword from '../Screens/ResetPassword';
// import SearchScreen from '../Screens/Components/SearchScreen';
// import PersonalProfile from '../Screens/PersonalProfile';
// import CommunityInfoScreen from '../Screens/CommunityInfo';
// import CommunityInfo from '../Screens/CommunityInfo';
// import ViewDocuments from '../Screens/Components/ViewDocuments';
// import ImageViewer from '../Screens/Components/ImageViewer';
// import Favorite from '../Screens/Favorite';
// import PetAdoptionDetails from '../Screens/PetAdoptionDetails';
// import AddModerator from '../Screens/Components/AddModerator';
// import QRCodeGenerator from '../Screens/QRCodeGenerator';
// import AllCommunitiesScreen from '../Screens/AllCommunity';

// const Stack = createNativeStackNavigator();

// // const linking = {
// //   prefixes: ['beingpetz://', 'https://beingpetz.app'], // deep link prefixes
// //   config: {
// //     screens: {
// //       AllCommunitiesScreen: {
// //         path: 'community/:id',
// //         parse: {
// //           id: id => `${id}`,
// //         },
// //       },

// const linking = {
//   prefixes: ['beingpetz://', 'https://beingpetz.com'], // both app scheme and real domain
//   config: {
//     screens: {
//       AllCommunitiesScreen: {
//         path: 'community/:id',
//         parse: {
//           id: id => `${id}`,
//         },
//       },
//       // add more screens if needed
//     },
//   },
// };

// function StackNavigation() {
//   return (
//     <NavigationContainer linking={linking}>
//       <Stack.Navigator>
//         <Stack.Screen
//           name="Splash"
//           component={Splash}
//           options={{
//             headerShown: false,
//             cardStyleInterpolator: ({current}) => ({
//               cardStyle: {
//                 opacity: current.progress,
//               },
//             }),
//           }}
//         />
//         <Stack.Screen
//           name="Splash2"
//           component={Splash2}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Login"
//           component={Login}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="OTP"
//           component={OTP}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Pet Parent Form"
//           component={PetParentForm}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Pet Form"
//           component={PetForm}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Home"
//           component={Home}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="BottomNavigation"
//           component={BottomTabNavigator}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Chat"
//           component={ChatScreen}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="AdoptPet"
//           component={AdoptPet}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="GiveForAdoption"
//           component={GiveForAdoption}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="GiveForAdoption2"
//           component={GiveForAdoption2}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="LostPet"
//           component={LostPet}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="PetDetails"
//           component={PetsDetail}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Signup"
//           component={Signup}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Chats"
//           component={Chats}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="IndividualChat"
//           component={IndividualChats}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Add"
//           component={Add}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Edit Pet"
//           component={EditPetInfo}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Add Pet"
//           component={AddPets}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="CreateCommunity"
//           component={CreateCommunity}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="MyPosts"
//           component={MyPosts}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="ViewAll"
//           component={ViewAll}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="EditRecord"
//           component={EditRecordScreen}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="AddLostAndFound"
//           component={AddLostAndFound}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Service Description"
//           component={ServicesDescription}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="RecoverPassword"
//           component={RecoverPassword}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="ResetPassword"
//           component={ResetPassword}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Search"
//           component={SearchScreen}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="PersonalProfile"
//           component={PersonalProfile}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="CommunityInfo"
//           component={CommunityInfo}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="ViewDocuments"
//           component={ViewDocuments}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="ImageViewer"
//           component={ImageViewer}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="Favorite"
//           component={Favorite}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="PetAdoptionDetails"
//           component={PetAdoptionDetails}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="AddModerator"
//           component={AddModerator}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="QR"
//           component={QRCodeGenerator}
//           options={{headerShown: false}}
//         />
//         <Stack.Screen
//           name="AllCommunitiesScreen"
//           component={AllCommunitiesScreen}
//           options={{headerShown: false}}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// export default StackNavigation;

import React from 'react';
import {
  createNativeStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Splash from '../Screens/Splash';
import Login from '../Screens/Login';
import OTP from '../Screens/OTP';
import PetParentForm from '../Screens/PetParentForm';
import PetForm from '../Screens/PetForm';
import Home from '../Screens/Home';
import BottomTabNavigator from './BottomNavigation';
import ChatScreen from '../Screens/ChatScreen';
import AdoptPet from '../Screens/AdoptPet';
import GiveForAdoption from '../Screens/GiveForAdoption';
import GiveForAdoption2 from '../Screens/GiveForAdoption2';
import LostPet from '../Screens/LostPet';
import LostPetDetail from '../Screens/LostPetDetail';
import PetsDetail from '../Screens/LostPetDetail';
import Signup from '../Screens/Signup';
import Chats from '../Screens/Chats';
import IndividualChats from '../Screens/IndividualChats';
import Add from '../Screens/Add';
import Splash2 from '../Screens/Splash2';
import EditPetInfo from '../Screens/EditPetInfo';
import AddPets from '../Screens/AddPets';
import CreateCommunity from '../Screens/CreateCommunity';
import MyPosts from '../Screens/MyPosts';
import ViewAll from '../Screens/ViewAll';
import EditRecordScreen from '../Screens/Components/EditRecordScreen';
import AddLostAndFound from '../Screens/AddLostAndFound';
import ServicesDescription from '../Screens/Components/ServicesDescription';
import RecoverPassword from '../Screens/RecoverPassword';
import ResetPassword from '../Screens/ResetPassword';
import SearchScreen from '../Screens/Components/SearchScreen';
import PersonalProfile from '../Screens/PersonalProfile';
import CommunityInfo from '../Screens/CommunityInfo';
import ViewDocuments from '../Screens/Components/ViewDocuments';
import ImageViewer from '../Screens/Components/ImageViewer';
import Favorite from '../Screens/Favorite';
import PetAdoptionDetails from '../Screens/PetAdoptionDetails';
import AddModerator from '../Screens/Components/AddModerator';
import QRCodeGenerator from '../Screens/QRCodeGenerator';
import AllCommunitiesScreen from '../Screens/AllCommunity';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['beingpetz://', 'https://beingpetz.com'],
  config: {
    screens: {
      AllCommunitiesScreen: {
        path: 'community/:id',
        parse: {
          id: id => `${id}`,
        },
      },
    },
  },
};

function StackNavigation() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#8337B2', // Or your app background color
        }}
        edges={['bottom','top']}>
        <NavigationContainer linking={linking}>
          <Stack.Navigator>
            <Stack.Screen
              name="Splash"
              component={Splash}
              options={{
                headerShown: false,
                cardStyleInterpolator: ({current}) => ({
                  cardStyle: {
                    opacity: current.progress,
                  },
                }),
              }}
            />
            <Stack.Screen
              name="Splash2"
              component={Splash2}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Login"
              component={Login}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="OTP"
              component={OTP}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Pet Parent Form"
              component={PetParentForm}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Pet Form"
              component={PetForm}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Home"
              component={Home}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="BottomNavigation"
              component={BottomTabNavigator}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AdoptPet"
              component={AdoptPet}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="GiveForAdoption"
              component={GiveForAdoption}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="GiveForAdoption2"
              component={GiveForAdoption2}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="LostPet"
              component={LostPet}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PetDetails"
              component={PetsDetail}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Signup"
              component={Signup}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Chats"
              component={Chats}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="IndividualChat"
              component={IndividualChats}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Add"
              component={Add}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Edit Pet"
              component={EditPetInfo}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Add Pet"
              component={AddPets}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="CreateCommunity"
              component={CreateCommunity}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="MyPosts"
              component={MyPosts}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ViewAll"
              component={ViewAll}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="EditRecord"
              component={EditRecordScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AddLostAndFound"
              component={AddLostAndFound}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Service Description"
              component={ServicesDescription}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="RecoverPassword"
              component={RecoverPassword}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPassword}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PersonalProfile"
              component={PersonalProfile}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="CommunityInfo"
              component={CommunityInfo}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ViewDocuments"
              component={ViewDocuments}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ImageViewer"
              component={ImageViewer}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Favorite"
              component={Favorite}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PetAdoptionDetails"
              component={PetAdoptionDetails}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AddModerator"
              component={AddModerator}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="QR"
              component={QRCodeGenerator}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AllCommunitiesScreen"
              component={AllCommunitiesScreen}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default StackNavigation;
