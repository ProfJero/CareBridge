//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-vGYr4YEr.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/workspace/src/routes/__root.tsx",
		children: ["/", "/admin"],
		preloads: ["/assets/index-DSfR0sdi.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-DSfR0sdi.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-CeIwITbb.js",
			"/assets/ui-Bzw5HwJ5.js",
			"/assets/application-inbox-CjL3417G.js"
		]
	},
	"/admin": {
		filePath: "/workspace/src/routes/admin.tsx",
		children: ["/admin/login", "/admin/"],
		preloads: ["/assets/admin-Cbbq84Pv.js"]
	},
	"/admin/login": {
		filePath: "/workspace/src/routes/admin.login.tsx",
		children: void 0,
		preloads: [
			"/assets/admin.login-CVykQ923.js",
			"/assets/ui-Bzw5HwJ5.js",
			"/assets/demo-session-8oR6vbd6.js"
		]
	},
	"/admin/": {
		filePath: "/workspace/src/routes/admin.index.tsx",
		children: void 0,
		preloads: [
			"/assets/admin.index-CSfM-GDn.js",
			"/assets/ui-Bzw5HwJ5.js",
			"/assets/application-inbox-CjL3417G.js",
			"/assets/demo-session-8oR6vbd6.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
