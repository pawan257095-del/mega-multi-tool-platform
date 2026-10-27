declare module "bcryptjs" {
  const bcrypt: {
    hash(password: string, rounds: number): Promise<string>;
  };
  export default bcrypt;
}
