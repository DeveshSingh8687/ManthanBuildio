import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screen/HomeScreen';
import LoginScreen from '../screen/LoginScreen';
import ForgetPassword from '../screen/ForgotPassword';
import SignUpScreen from '../screen/SignUpScreen';
import LaunchScreen from '../screen/LaunchScreen';
import WelcomeScreen from '../screen/WalkThroughScreen1';
import WelcomeScreen2 from '../screen/WalkThroughScreen2';
import WelcomeScreen3 from '../screen/WalkThroughScreen3';
import AddJobScreen from '../screen/PostJob';
import PickJob from '../screen/PickJob';
import NewsScreen from '../screen/NewsScreen';
import JobDetailsScreen from '../screen/JobDetailsScreen';
import AccountScreen from '../screen/UserDetailsScreen';
import UserDetailScreen from '../screen/UserDetailForm';
import JobsSection from '../screen/JobsSection';
import JobListComponent from '../screen/MyJoblistScreen'
import UserScreen from '../screen/ThirdUserScreen';
import Feed from '../screen/FeedScreen';
const Stack = createNativeStackNavigator();
export type RootStackParamList = {
  HomeScreen: undefined; // Add other screens here as needed
  Login: undefined;
  ForgotPassword: undefined;
  SignUp: undefined;
  Launch:undefined;
  Welcome:undefined;
  Welcome2:undefined;
  Welcome3:undefined
  JobDetailS: undefined;
  PickJob?: { showLikeAndShareButton: boolean; showHeading: string };
  NewsScreen: undefined;
  JobDetailsScreen: undefined;
  AccountScreen: undefined;
  UserDetailScreen:undefined;
  TopTabsComponent: undefined;
  JobsSection:undefined;
  JobListComponent:undefined;
  UserScreen: undefined;
  Feed: undefined;

};

export default function Navigation() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="Launch" component={LaunchScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Welcome2" component={WelcomeScreen2} options={{ headerShown: false }} />
        <Stack.Screen name="Welcome3" component={WelcomeScreen3} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgetPassword} options={{ headerShown: false }} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="JobDetailS" component={AddJobScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PickJob" component={PickJob} options={{ headerShown: false }} />
          <Stack.Screen name="NewsScreen" component={NewsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="JobDetailsScreen" component={JobDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AccountScreen" component={AccountScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UserDetailScreen" component={UserDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="JobsSection" component={JobsSection} options={{ headerShown: false }} />  
          <Stack.Screen name="JobListComponent" component={JobListComponent} options={{ headerShown: false }} /> 
          <Stack.Screen name="UserScreen" component={UserScreen} options={{ headerShown: false }} />   
          <Stack.Screen name="Feed" component={Feed} options={{ headerShown: false }} />               
            
        </Stack.Navigator>
      </NavigationContainer>
    );
  }