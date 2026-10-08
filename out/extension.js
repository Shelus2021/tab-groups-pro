"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// VS Code extensibility API
const vscode = require("vscode");
const TreeDataProvider_1 = require("./TreeDataProvider");
const Util_1 = require("./Util");
/**
 * Called when the extension is started
 */
async function activate(context) {
    let treeDataProvider = new TreeDataProvider_1.TreeDataProvider(context);
    const treeView = vscode.window.createTreeView(Util_1.EXTENSION_ID, {
        treeDataProvider: treeDataProvider
    });
    treeDataProvider.setTreeView(treeView);
    await treeDataProvider.load();
    // 注册所有需要清理的资源
    context.subscriptions.push(
        treeDataProvider,  // TreeDataProvider 需实现 dispose()
        treeView           // TreeView 本身是 Disposable
    );
    return context;
}
exports.activate = activate;
/**
 * Called when the extension is stopped, or vscode is closed
 */
function deactivate() {
    (0, Util_1.disposeOutputChannel)();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
