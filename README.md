# Axis code test

Completed the Axis coding test.

Backend uses local data as a mock database, complete with login credentials for three users:

| username | password |
|---|---|
| alice | alice-password |
| bob | bob-password |
| admin | admin-password |

alice and bob can only view their own assigned cameras.

Only the admin user has authority to manage cameras and assign to other users.

[Screencast from 2026-08-12 16:12:43.webm](https://github.com/user-attachments/assets/5f282a38-ea7a-4187-b21a-ddafdf155da9)

# Assignment details

## Getting started

This is a monorepo with two packages, backend and frontend, using npm workspaces. Easiest way to get started with the test is to fork this repo do the tasks there. When you're done send us a link to your fork.

If you run into any issues or have questions don't hesitate to contact the technical interviewer.

### Tools

- NodeJS
- GitHub

### Start dev environment

1. `npm install`
2. `npm run dev` to start both backend and frontend.
3. Access GraphQL-devtool on http://localhost:4000/graphql

## Task 1: Extending the GraphQL Server with more types

### Objectives

- Extend the existing GraphQL server to map Users to specific Cameras.
  - Keep in mind that you should be able to log in using a User in Task 2.
- Add functionality to add a camera to a User
- Add functionality to remove a camera from a User

## Task 2: Create a React app that consumes the previous GraphQL-API

### Requirements

- React
- Typescript
- Fluent UI v9

### Objective

Create a React app in the "frontend"-package that displays all cameras related to the currently logged in user. Use the API you've extended in task 1.
