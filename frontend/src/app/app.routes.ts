import { Routes } from '@angular/router';
import { ChatPage } from './components/chat-page/chat-page';
import { CustomerSignIn } from './components/customer-sign-in/customer-sign-in';
import { CustomerSignUp } from './components/customer-sign-up/customer-sign-up';
import { FirstPage } from './components/first-page/first-page';
import { Component } from '@angular/core';
import { Users } from './components/users/users';

export const routes: Routes = [
    {
        path: "",
        component: FirstPage,
    },
    {
        path: "SignIn",
        component: CustomerSignIn,
    },
    {
        path: "SignUp",
        component: CustomerSignUp,
    },
    {
        path: "ChatPage",
        component: ChatPage,
    },
    {
        path: "UsersPage",
        component: Users,
    }
];
