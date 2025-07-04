import { Role } from "../enums/role";

export interface User{
  id:string;
  name:string;
  userName:string;
  password:string;
  role:Role;
}
