"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeItem = void 0;
const vscode = require("vscode");
const path = require("path");
/**
 * The tree item class. Represents an item in the explorer tree.
 */
class TreeItem extends vscode.TreeItem {
    constructor(label, file, isRoot, id) {
        const relativeFile = isRoot ? undefined : label;
        const fileName = isRoot ? label : path.basename(relativeFile);
        const relativePath = isRoot ? "" : path.dirname(relativeFile);
        const superLabel = isRoot ? label : fileName;
        // 默认展开/折叠状态
        const collapsibleState = isRoot ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None;
        // 使用准备好的参数调用 super
        super(superLabel, collapsibleState);
        // 初始化
        this.isRoot = isRoot;
        this.file = file;//绝对路径
        this.id = id || `${isRoot ? "group" : "item"}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        // 设置文件图标
        this.resourceUri = isRoot? undefined : vscode.Uri.file(file);
        // 设置文件描述
        this.description = isRoot || relativePath === "." ? undefined : relativePath;
        // 设置悬停提示
        this.tooltip = isRoot ? label : file;
        // 自定义
        this.relativeFile = relativeFile;
        this.parentLabel = undefined;
        this.children = [];
    }

    /**
     * Set the parent's label.
     * @param pLabel The parent's label
     */
    setParentLabel(pLabel) {
        if (this.isRoot) {
            throw new Error('Cannot assign parentLabel to a root object.');
        }
        this.parentLabel = pLabel;
    }
    /**
     * Get a child's index from this tree that matches a given item
     * @param other The item to use as comparison
     * @returns The child that matches the given item, or undefined.
     */
    get_child_index(other) {
        let i = 0;
        for (let item of this.children) {
            if (item.label === other.label && item.file === other.file) {
                return i;
            }
            i += 1;
        }
        return -1;
    }
    /**
     * Check if this item has a child that matches a given item
     * @param other The item to be checked for
     * @returns True if this item has a child that matches the given object, or false if otherwise
     */
    has_child(other) {
        return this.get_child_index(other) > -1;
    }
    /**
     * Add a child to this item
     * @param other The item to be added
     */
    add_child(other) {
        // Only add if this object is a root
        if (!this.isRoot) {
            throw new Error('Can not add child to child item.');
        }
        // 避免在初始化树添加节点时展开
        // this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        // if there is already this child, ignore
        const index = this.get_child_index(other);
        if (index > -1) {
            // 对于 组 已经存在的，不需要警告
            // vscode.window.showWarningMessage(`File with path '${other.file}' has already been added to this group.`);
        }
        else {
            this.children.push(other);
        }
    }

    // 新增：更新分组悬停信息（当子项变化时调用）
    updateTooltip() {
        if (this.isRoot) {
            this.tooltip = this.label+" ("+this.children.length+" files)";
        }
    }
    
    /**
     * Convert this item into JSON data
     * @returns This item's data as a JSON
     */
    async toJSON() {
        var childrenData = {};
        // loop the data in this tree and pass it all to json format
        for (let i = 0; i < this.children.length; i++) {
            const childJSON = await this.children[i].toJSON();
            childrenData[`key_${i}`] = childJSON;
        }
        return {
            label: this.label,
            collapsibleState: this.collapsibleState,
            file: this.file,
            id: this.id,
            isRoot: this.isRoot,
            resourceUri: this.resourceUri,
            description: this.description,
            tooltip: this.tooltip,
            // 自定义属性
            relativeFile:this.relativeFile,
            parentLabel: this.parentLabel,
            children: childrenData
        };
    }
    /**
     * Convert JSON formatted data into a tree item object
     * @param data The data to be parsed
     * @returns A new TreeItem object
     */
    static async fromJSON(data) {
        const label = data["label"];
        const file_path = data["file"];
        const isRoot = data["isRoot"];
        const id = data["id"];
        const item = new TreeItem(label, file_path, isRoot, id);
        if (isRoot && "collapsibleState" in data) {
            const savedState = data["collapsibleState"];
            item.collapsibleState = savedState === true || savedState === vscode.TreeItemCollapsibleState.Expanded
                ? vscode.TreeItemCollapsibleState.Expanded
                : vscode.TreeItemCollapsibleState.Collapsed;
        }
        if (!isRoot && "resourceUri" in data) {
            item.resourceUri = data["resourceUri"];
        }
        if ("description" in data) {
            item.description = data["description"];
        }
        if ("tooltip" in data) {
            item.tooltip = data["tooltip"];
        }
        if ("relativeFile" in data) {
            item.relativeFile = data["relativeFile"];
        }
        if (!isRoot && "parentLabel" in data) {
            item.setParentLabel(data["parentLabel"]);
        }
        for (let key in data["children"]) {
            let objValue = data["children"][key];
            const child = await TreeItem.fromJSON(objValue);
            item.add_child(child);
        }
        return item;
    }
}
exports.TreeItem = TreeItem;
//# sourceMappingURL=TreeItem.js.map
