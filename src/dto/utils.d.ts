export type sidebarDataProps = {
  title: string;
  pathName: string;
  activeIcon: React.ReactNode;
  inAtiveIcon: React.ReactNode;
  subMenu?: {
    title: string;
    pathName: string;
  }[];
};

export type CartNumber = "one" | "two" | "three" | "four" | "five";
