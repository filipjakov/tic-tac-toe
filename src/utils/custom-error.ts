import { CustomErrorType } from "../enums/cutom-error-type.enum";
import { ApolloError, ValidationError, UserInputError } from "apollo-server-express";

export class CustomError extends Error {
  constructor(
    public message: string,
    public type: CustomErrorType
  ) {
    super(message);
  }
}

export function mapToApolloError({ message, type }: CustomError): ApolloError {
  return new Map([
    [CustomErrorType.NO_OBJECT, new ValidationError(message)],
    [CustomErrorType.ILLEGAL_MOVE, new UserInputError(message)],
  ]).get(type) ?? new ApolloError(message);
}
