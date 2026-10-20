export interface BuiltUserData {
  name: string;
  email: string;
  password: string | null;
  roleId: string;
}

/**
 * Cada forma de crear un usuario (registro, Google, admin...) sabe
 * convertir SU propio tipo de entrada en los datos ya resueltos que
 * Prisma necesita (rol buscado, password hasheado si corresponde).
 * UserFactory no sabe nada de esas diferencias, solo inserta.
 */
export interface UserCreationStrategy<TInput> {
  buildUserData(input: TInput): Promise<BuiltUserData>;
}
