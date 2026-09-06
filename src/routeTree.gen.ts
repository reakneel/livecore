/* eslint-disable */
// @ts-nocheck
// Generated route tree for the standalone Vite client.
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ArchitectureRouteImport } from './routes/architecture'
const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const ArchitectureRoute = ArchitectureRouteImport.update({ id: '/architecture', path: '/architecture', getParentRoute: () => rootRouteImport } as any)
export interface FileRoutesByFullPath { '/': typeof IndexRoute; '/architecture': typeof ArchitectureRoute }
export interface FileRoutesByTo { '/': typeof IndexRoute; '/architecture': typeof ArchitectureRoute }
export interface FileRoutesById { __root__: typeof rootRouteImport; '/': typeof IndexRoute; '/architecture': typeof ArchitectureRoute }
export interface FileRouteTypes { fileRoutesByFullPath: FileRoutesByFullPath; fullPaths: '/' | '/architecture'; fileRoutesByTo: FileRoutesByTo; to: '/' | '/architecture'; id: '__root__' | '/' | '/architecture'; fileRoutesById: FileRoutesById }
export interface RootRouteChildren { IndexRoute: typeof IndexRoute; ArchitectureRoute: typeof ArchitectureRoute }
declare module '@tanstack/react-router' { interface FileRoutesByPath {
  '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
  '/architecture': { id: '/architecture'; path: '/architecture'; fullPath: '/architecture'; preLoaderRoute: typeof ArchitectureRouteImport; parentRoute: typeof rootRouteImport }
} }
const rootRouteChildren: RootRouteChildren = { IndexRoute, ArchitectureRoute }
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()
