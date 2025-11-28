import React, { ReactNode, ComponentType } from 'react';

// Allow string for dynamic game IDs
export type AppId = 'market' | 'settings' | 'calculator' | 'notepad' | 'assistant' | 'explorer' | 'video' | 'music' | string;

export interface AppDefinition {
  id: AppId;
  title: string;
  icon: ReactNode;
  component: ComponentType<any>;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface WindowState {
  id: string; // unique instance id
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  // Optional data passed to the app (e.g., which game to load or file to open)
  data?: any;
}

export interface DesktopItem {
  id: string;
  appId: AppId;
  x: number;
  y: number;
}

export interface MarketItem {
  id: number;
  name: string;
  category: string;
  rating: number;
  price: string;
  imageColor: string;
}

export interface ThemeConfig {
  name: string;
  id: string;
  primary: string;      // bg-color-600
  hover: string;        // hover:bg-color-500
  text: string;         // text-color-500 or 400
  border: string;       // border-color-500
  accentBg: string;     // bg-color-500
  shadow: string;       // shadow-color-500/50
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light'
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  app: string;
  time: string;
  icon?: ReactNode;
}

export type ViewMode = 'small' | 'medium' | 'large';
export type SortMode = 'name' | 'size' | 'type';