/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";

export type NavItem = {
  name: string;
  path: string;
  icon?: React.ComponentType<any>;
  children?: NavItem[];
};

export type NavGroup = {
  group: string;
  items: NavItem[];
};
