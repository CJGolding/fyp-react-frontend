import {NODE_SIZE_CONSTANT, SIBLING_DISTANCE, TREE_DISTANCE} from "./constants.js";

/**
 * Implements the Reingold-Tilford "tidy" tree layout algorithm to calculate the X and Y positions of nodes in a binary tree.
 * Key steps of the algorithm include:
 * 1. Constructing a tree structure from the input heap array.
 * 2. Performing a post-order traversal to calculate initial X positions for each node based on their children and siblings.
 * 3. Checking for conflicts between subtrees and applying shifts to ensure that nodes do not overlap.
 * 4. Adjusting the entire tree to ensure all nodes are visible on the screen.
 * 5. Performing a pre-order traversal to calculate final positions by applying accumulated modifiers.
 * 6. Flattening the tree structure back into an array format with calculated positions for rendering.
 */
class TreeNode {
    constructor(game, index, parent = null, depth = 0) {
        this.game = game;
        this.index = index;
        this.parent = parent;
        this.children = [];
        this.xPos = -1;
        this.yPos = depth;
        this.mod = 0;
    }

    isLeaf() {
        return this.children.length === 0;
    }

    isLeftMost() {
        if (!this.parent) return true;
        return this.parent.children[0] === this;
    }

    getPreviousSibling() {
        if (!this.parent || this.isLeftMost()) return null;
        const index = this.parent.children.indexOf(this);
        return this.parent.children[index - 1];
    }
}

/**
 * Converts a binary heap represented as an array into a tree structure of TreeNode instances.
 */
function arrayToTree(heap, parent = null, index = 0, depth = 0) {
    if (index >= heap.length) return null;

    const currentNode = new TreeNode(heap[index], index, parent, depth);

    const leftChildIndex = 2 * index + 1;
    const rightChildIndex = 2 * index + 2;

    if (leftChildIndex < heap.length) {
        const leftChild = arrayToTree(heap, currentNode, leftChildIndex, depth + 1);
        if (leftChild) currentNode.children.push(leftChild);
    }

    if (rightChildIndex < heap.length) {
        const rightChild = arrayToTree(heap, currentNode, rightChildIndex, depth + 1);
        if (rightChild) currentNode.children.push(rightChild);
    }

    return currentNode;
}

/**
 * Performs a post-order traversal to calculate initial X positions for each node based on their children and siblings.
 */
function calculateInitialX(node) {
    node.children.forEach(child => calculateInitialX(child));

    // If a leaf node
    if (node.isLeaf()) {
        if (!node.isLeftMost()) {
            node.xPos = node.getPreviousSibling().xPos + NODE_SIZE_CONSTANT + SIBLING_DISTANCE;
        } else {
            node.xPos = 0;
        }
    }
    // If there is only one child
    else if (node.children.length === 1) {
        const leftChild = node.children[0];

        if (node.isLeftMost()) {
            node.xPos = leftChild.xPos;
        } else {
            node.xPos = node.getPreviousSibling().xPos + NODE_SIZE_CONSTANT + SIBLING_DISTANCE;
            node.mod = node.xPos - leftChild.xPos;
        }
    }
    // If there are two children
    else {
        const leftChild = node.children[0];
        const rightChild = node.children[1];
        const mid = (leftChild.xPos + rightChild.xPos) / 2;

        if (node.isLeftMost()) {
            node.xPos = mid;
        } else {
            node.xPos = node.getPreviousSibling().xPos + NODE_SIZE_CONSTANT + SIBLING_DISTANCE;
            node.mod = node.xPos - mid;
        }
    }

    if (node.children.length > 0 && !node.isLeftMost()) {
        checkForConflicts(node);
    }
}

/**
 * Checks for conflicts between the current node's subtree and its left siblings' subtrees.
 * If a conflict is detected, it applies a shift to the current node and its subtree to resolve the conflict.
 */
function checkForConflicts(node) {
    const minDistance = TREE_DISTANCE + NODE_SIZE_CONSTANT;
    let shiftValue = 0;

    const nodeContour = {};
    getLeftContour(node, 0, nodeContour);

    const leftSibling = node.parent.children[0];

    if (!leftSibling || leftSibling === node) return;

    const siblingContour = {};
    getRightContour(leftSibling, 0, siblingContour);

    const maxDepthNode = Math.max(...Object.keys(nodeContour).map(Number));
    const maxDepthSibling = Math.max(...Object.keys(siblingContour).map(Number));
    const maxDepth = Math.min(maxDepthNode, maxDepthSibling);

    for (let level = node.yPos + 1; level <= maxDepth; level++) {
        if (nodeContour[level] !== undefined && siblingContour[level] !== undefined) {
            const distance = nodeContour[level] - siblingContour[level];
            if (distance + shiftValue < minDistance) {
                shiftValue = minDistance - distance;
            }
        }
    }

    if (shiftValue > 0) {
        node.xPos += shiftValue;
        node.mod += shiftValue;
    }
}


/**
 * Performs a traversal to calculate the left contours of the tree,
 * which are used to detect overlaps and ensure that all nodes are visible on the screen.
 */
function getLeftContour(node, modSum, values) {
    if (!Object.prototype.hasOwnProperty.call(values, node.yPos)) {
        values[node.yPos] = node.xPos + modSum;
    } else {
        values[node.yPos] = Math.min(values[node.yPos], node.xPos + modSum);
    }

    modSum += node.mod;
    node.children.forEach(child => {
        getLeftContour(child, modSum, values);
    });
}

/**
 * Performs a traversal to calculate the right contours of the tree,
 * which are used to detect overlaps and ensure that all nodes are visible on the screen.
 */
function getRightContour(node, modSum, values) {
    if (!Object.prototype.hasOwnProperty.call(values, node.yPos)) {
        values[node.yPos] = node.xPos + modSum;
    } else {
        values[node.yPos] = Math.max(values[node.yPos], node.xPos + modSum);
    }

    modSum += node.mod;
    node.children.forEach(child => {
        getRightContour(child, modSum, values);
    });
}

/**
 * Checks if any part of the tree is off-screen and applies a shift to the entire tree if necessary to ensure all nodes are visible.
 */
function checkAllChildrenOnScreen(node) {
    const nodeContour = {};
    getLeftContour(node, 0, nodeContour);

    let shiftAmount = 0;
    Object.keys(nodeContour).forEach(y => {
        if (nodeContour[y] + shiftAmount < 0) {
            shiftAmount = -nodeContour[y];
        }
    });

    if (shiftAmount > 0) {
        node.xPos += shiftAmount;
        node.mod += shiftAmount;
    }
}

/**
 * Performs a pre-order traversal to calculate final X positions for each node by applying accumulated modifiers from the root to each node.
 */
function calculateFinalPositions(node, modSum = 0) {
    node.xPos += modSum;
    modSum += node.mod;

    node.children.forEach(child => {
        calculateFinalPositions(child, modSum);
    });
}

/**
 * Flattens the tree structure back into an array format with calculated positions for rendering.
 * Each node's position is stored along with its index and game data.
 */
function flattenTree(node, positions = []) {
    positions.push({
        x: node.xPos,
        y: node.yPos,
        index: node.index,
        game: node.game
    });

    node.children.forEach(child => {
        flattenTree(child, positions);
    });

    return positions;
}


/**
 * Main function to calculate the tree layout for a given array of games representing a binary heap.
 */
export default function calculateTreeLayout(games) {
    if (!games || games.length === 0) return [];

    const root = arrayToTree(games);
    if (!root) return [];

    // Post-order traversal
    calculateInitialX(root);

    // First pre-order traversal
    checkAllChildrenOnScreen(root);

    // Second pre-order traversal
    calculateFinalPositions(root, 0);

    return flattenTree(root);
}