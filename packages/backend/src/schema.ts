import { GraphQLError } from "graphql";
import { createSchema } from "graphql-yoga";

import {
  addCameraToUser,
  createCameraForUser,
  getCamera,
  getCameras,
  getCamerasForUser,
  getUser,
  getUserBySessionToken,
  getUsers,
  loginUser,
  removeCameraFromUser,
  userHasCamera,
  type Camera,
  type User,
} from "./data";

export type BackendContext = {
  sessionToken?: string;
};

const typeDefinition = /* GraphQL */ `
  type Query {
    me: User!
    cameras: [Camera!]!
    camera(id: ID!): Camera
    users: [User!]!
    allCameras: [Camera!]!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    addCamera(
      userId: ID!
      name: String!
      niceName: String
      address: String!
    ): Camera!
    addCameraToUser(userId: ID!, cameraId: ID!): User!
    removeCameraFromUser(userId: ID!, cameraId: ID!): User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    name: String!
    isAdmin: Boolean!
    cameras: [Camera!]!
  }

  type Camera {
    id: ID!
    name: String!
    niceName: String
    address: String!
  }
`;

type LoginArgs = {
  username: string;
  password: string;
};

type UserCameraArgs = {
  userId: string;
  cameraId: string;
};

const getCurrentUser = (context: BackendContext) => {
  const user = getUserBySessionToken(context.sessionToken);

  if (!user) {
    throw new GraphQLError("You must be logged in to access cameras.");
  }

  return user;
};

const getCurrentAdmin = (context: BackendContext) => {
  const user = getCurrentUser(context);

  if (!user.isAdmin) {
    throw new GraphQLError("You must be an admin to manage cameras.");
  }

  return user;
};

const getTargetUser = (userId: string) => {
  const user = getUser(userId);

  if (!user) {
    throw new GraphQLError("User not found.");
  }

  return user;
};

const resolvers = {
  Query: {
    me: (_parent: unknown, _args: unknown, context: BackendContext) =>
      getCurrentUser(context),
    cameras: (_parent: unknown, _args: unknown, context: BackendContext) => {
      const user = getCurrentUser(context);

      return getCamerasForUser(user.id);
    },
    camera: (
      _parent: unknown,
      args: Pick<Camera, "id">,
      context: BackendContext,
    ) => {
      const user = getCurrentUser(context);

      // Return null instead of another user's camera.
      return userHasCamera(user.id, args.id) ? getCamera(args.id) : null;
    },
    users: (_parent: unknown, _args: unknown, context: BackendContext) => {
      getCurrentAdmin(context);

      return getUsers();
    },
    allCameras: (_parent: unknown, _args: unknown, context: BackendContext) => {
      getCurrentAdmin(context);

      return getCameras();
    },
  },
  Mutation: {
    login: (_parent: unknown, args: LoginArgs) => {
      const session = loginUser(args.username, args.password);

      if (!session) {
        throw new GraphQLError("Invalid username or password.");
      }

      return session;
    },
    addCamera: (
      _parent: unknown,
      args: Omit<Camera, "id"> & { userId: string },
      context: BackendContext,
    ) => {
      getCurrentAdmin(context);
      const user = getTargetUser(args.userId);
      const { userId: _userId, ...cameraArgs } = args;

      return createCameraForUser(user.id, cameraArgs);
    },
    addCameraToUser: (
      _parent: unknown,
      args: UserCameraArgs,
      context: BackendContext,
    ) => {
      getCurrentAdmin(context);
      const user = getTargetUser(args.userId);
      const camera = getCamera(args.cameraId);

      if (!camera) {
        throw new GraphQLError("Camera not found.");
      }

      addCameraToUser(user.id, camera.id);

      return user;
    },
    removeCameraFromUser: (
      _parent: unknown,
      args: UserCameraArgs,
      context: BackendContext,
    ) => {
      getCurrentAdmin(context);
      const user = getTargetUser(args.userId);

      removeCameraFromUser(user.id, args.cameraId);

      return user;
    },
  },
  User: {
    cameras: (parent: User) => getCamerasForUser(parent.id),
  },
};

export const schema = createSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinition],
});
