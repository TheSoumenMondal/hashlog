export type blogType = {
  id: string;
  title: string;
  description: string;
  blogcontent: string;
  image: string;
  category: string;
  author: string;
  createdAt: string;
};


export interface User {
  name: string;
  email: string;
  password: string;
  bio: string;
  image: string;
  instagram: string;
  linkedIn: string;
  github: string;
  facebook: string;
  youtube: string;
}
