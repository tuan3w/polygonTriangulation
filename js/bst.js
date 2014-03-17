/*
 * File: bst.js
 *
 * A pure JavaScript implementation of a binary search tree.
 *
 */
COMP = {
    'LESS': -1,
    'EQUAL': 0,
    'GREATER':1
};

/*
 * Class: BST
 *
 * The binary search tree class.
 *
 */
var BST = function (comparefunc) {
    var comp = comparefunc;
    /*
     * Private Class: Node
     *
     * A BST node constructor
     *
     * Parameters:
     *        leftChild - a reference to the left child of the node.
     *        key - The key of the node.
     *        value - the value of the node.
     *        rightChild - a reference to the right child of the node.
     *        parent - a reference to the parent of the node.
     *
     * Note: All parameters default to null.
     */
    var Node = function (leftChild, key, value, rightChild, parent) {
        return {
leftChild: (typeof leftChild === "undefined") ? null :
               leftChild,
               key: (typeof key === "undefined") ? null : key,
               value: (typeof value === "undefined") ? null : value,
               rightChild: (typeof rightChild === "undefined") ? null :
                   rightChild,
               parent: (typeof parent === "undefined") ? null : parent
        };
    },

        /*
         * Private Variable: root
         *
         * The root nade of the BST.
         */
    root = new Node(),

    /*
     * Private Method: searchNode
     *
     * Search through a binary tree.
     *
     * Parameters:
     *     node - the node to search on.
     *     key - the key to search for (as an integer).
     *
     * Returns:
     *     the value of the found node,
     *     or null if no node was found.
     *
     */
    searchNode = function (node, key) {
        while(true) {
            if (node.key === null) {
                return null; // key not found
            }

            //var nodeKey = parseInt(node.key, 10);
            //
            var compresult  = comp(key, node.key);
            if (compresult == COMP.LESS) {
                node = node.leftChild;
                //return searchNode(node.leftChild, key);
            } else if (compresult == COMP.GREATER) {
                node = node.rightChild;
                //return searchNode(node.rightChild, key);
            } else { // key is equal to node key
                return node;
            }
        }
    },

    /*
     * Private Method: insertNode
     *
     * Insert into a binary tree.
     *
     * Parameters:
     *     node - the node to search on.
     *     key - the key to insert (as an integer).
     *     value - the value to associate with the key (any type of
     *             object).
     *
     * Returns:
     *     true.
     *
     */
    insertNode = function (node, key, value, parent) {
        //debugger;
        while(true) {
            if (node.key === null) {
                node.leftChild = new Node();
                node.key = key;
                node.value = value;
                node.rightChild = new Node();
                node.parent = parent;
                return node;
            }

            compresult  = comp(key, node.key);
            if (compresult == COMP.LESS) {
                parent = node;
                node = node.leftChild;
            } else if (compresult == COMP.GREATER) {
                parent = node;
                node = node.rightChild;
            } else { // key is equal to node key, update the value
                alert('equal');
                node.value = value;
                return node;
            }
        }
    },

    /*
     * Private Method: traverseNode
     *
     * Call a function on each node of a binary tree.
     *
     * Parameters:
     *     node - the node to traverse.
     *     callback - the function to call on each node, this function
     *                takes a key and a value as parameters.
     *
     * Returns:
     *     true.
     *
     */
    traverseNode = function (node, callback) {
        if (node.key !== null) {
            traverseNode(node.leftChild, callback);
            callback(node.key, node.value);
            traverseNode(node.rightChild, callback);
        }

        return true;
    },

    /*
     * Private Method: minNode
     *
     * Find the key of the node with the lowest key number.
     *
     * Parameters:
     *     node - the node to traverse.
     *
     * Returns: the key of the node with the lowest key number.
     *
     */
    minNode = function (node) {
        while (node.leftChild.key !== null) {
            node = node.leftChild;
        }

        return node;
    },

    /*
     * Private Method: maxNode
     *
     * Find the key of the node with the highest key number.
     *
     * Parameters:
     *     node - the node to traverse.
     *
     * Returns: the key of the node with the highest key number.
     *
     */
    maxNode = function (node) {
        while (node.rightChild.key !== null) {
            node = node.rightChild;
        }

        return node;
    },

    /*
     * Private Method: successorNode
     *
     * Find the key that successes the given node.
     *
     * Parameters:
     *		node - the node to find the successor for
     *
     * Returns: the key of the node that successes the given node.
     *
     */
    successorNode = function (node) {
        var parent;

        if (node.rightChild.key !== null) {
            return minNode(node.rightChild);
        }

        parent = node.parent;
        while (parent != null  &&  parent.key !== null && node == parent.rightChild) {
            node = parent;
            parent = parent.parent;
        }
        if (node == null)
            return undefined;
        else
            return parent;
    },

    /*
     * Private Method: predecessorNode
     *
     * Find the key that preceeds the given node.
     *
     * Parameters:
     *		node - the node to find the predecessor for
     *
     * Returns: the key of the node that preceeds the given node.
     *
     */
    predecessorNode = function (node) {
        var parent;

        if (node.leftChild.key !== null) {
            return maxNode(node.leftChild);
        }

        parent = node.parent;
        while (parent!= null && parent.key !== null && node == parent.leftChild) {
            node = parent;
            parent = parent.parent;
        }
        if (parent == null)
            return undefined;
        else
            return parent;
    };

    removeNode = function(node) {
        var childCount = (node.leftChild.key != null ? 1 : 0) + (node.rightChild.key != null ? 1 : 0);
        var parent = node.parent;
        if (node == root) {
            switch (childCount) {
                case 0:
                    root.key = null;
                break;

                case 1:
                    root = node.rightChild.key == null ? node.leftChild : node.rightChild;
                    root.parent = null;
                    break;
                case 2:
                    replacement = root.leftChild;
                while (replacement.rightChild.key != null){
                    replacementParent = replacement;
                    replacement = replacement.rightChild;
                }
                if (replacement != root.leftChild) {
                    replacementParent.rightChild = replacement.leftChild;
                    replacement.rightChild = root.rightChild;
                    replacement.leftChild = root.leftChild;

                    replacement.rightChild.parent = replacement;
                    replacement.leftChild.parent = replacement;
                }
                else {
                    replacement.rightChild = root.rightChild;
                    replacement.rightChild.parent = replacement;
                }
                root = replacement;
                root.parent = null;
                break;
            }
        }
        else {
            switch(childCount) {
                case 0:
                    if (comp(node.key, parent.key) == COMP.LESS) {
                    parent.leftChild.key = null;
                }else {
                    parent.rightChild.key = null;
                }
                break;
                case 1:

                if (comp(node.key, parent.key) == COMP.LESS) {
                    parent.leftChild = node.leftChild.key == null ? node.rightChild : node.leftChild;
                    parent.leftChild.parent = parent;
                }else {
                    parent.rightChild = node.leftChild.key == null ? node.rightChild : node.leftChild;
                    parent.rightChild.parent = parent;
                }
                break;
                case 2:
                    replacement = node.leftChild;
                    replacementParent = node;

                    while (replacement.rightChild.key != null){
                        replacementParent = replacement;
                        replacement = replacement.rightChild;
                    }

                    if (replacementParent != node) {
                        replacementParent.rightChild = replacement.leftChild;
                        replacementParent.rightChild.parent = replacementParent;
                        replacement.leftChild = node.leftChild;
                        replacement.leftChild.parent = replacement;
                    }
                //assign children to the replacement
                    replacement.rightChild = node.rightChild;
                    replacement.rightChild.parent = replacement;

                    if (comp(node.key, parent.key) == COMP.LESS) {
                        parent.leftChild = replacement;
                        parent.leftChild.parent = replacement;
                    }else {
                        parent.rightChild = replacement;
                        parent.rightChild.parent = parent;
                    }
                    break;
            }
        }

    }
    return {
        /*
         * Method: search
         *
         * Search through a binary tree.
         *
         * Parameters:
         *     key - the key to search for.
         *
         * Returns:
         *     the value of the found node,
         *     or null if no node was found,
         *     or undefined if no key was specified.
         *
         */
        search: function (key) {
            return searchNode(root, key);
        },

        /*
         * Method: insert
         *
         * Insert into a binary tree.
         *
         * Parameters:
         *     key - the key to search for.
         *     value - the value to associate with the key (any type of
         *             object).
         *
         * Returns:
         *     true,
         *     or undefined if no key was specified.
         *
         */
        insert: function (key, value) {
            return insertNode(root, key, value, null);
        },

        /*
         * Method: traverse
         *
         * Call a function on each node of a binary tree.
         *
         * Parameters:
         *     callback - the function to call on each node, this function
         *                takes a key and a value as parameters. If no
         *                callback is specified, print is called.
         *
         * Returns:
         *     true.
         *
         */
        traverse: function (callback) {
            if (typeof callback === "undefined") {
                callback = function (key, value) {
                    print(key + ": " + value);
                };
            }

            return traverseNode(root, callback);
        },

        /*
         * Method: min
         *
         * Find the key of the node with the lowest key number.
         *
         * Parameters: none
         *
         * Returns: the key of the node with the lowest key number.
         *
         */
        min: function () {
            return minNode(root);
        },

        /*
         * Method: max
         *
         * Find the key of the node with the highest key number.
         *
         * Parameters: none
         *
         * Returns: the key of the node with the highest key number.
         *
         */
        max: function () {
            return maxNode(root);
        },

        /*
         * Method: successor
         *
         * Find the key that successes the root node.
         *
         * Parameters: none
         *
         * Returns: the key of the node that successes the root node.
         *
         */
        successor: function (node) {
            return successorNode(node);
        },
        comp: comp,

        /*
         * Method: predecessor
         *
         * Find the key that preceeds the root node.
         *
         * Parameters: none
         *
         * Returns: the key of the node that preceeds the root node.
         *
         */
        predecessor: function (node) {
            return predecessorNode(node);
        },
        getRoot: function(){
            return root;
        },
        remove: function(node) {
            return removeNode(node);
        }
    };
};

/*
 * Tests
 */

//var ipTree = BST(function(a,b){
//if (a < b)
//return -1;
//else if (a > b)
//return 1;
//else
//return 0;
//});
//ipTree.insert(4, "test4");
//ipTree.insert(1, "test1");
//ipTree.insert(10, "test10");
//ipTree.insert(2, "test2");
//ipTree.insert(3, "test3");
//ipTree.insert(9, "test9");
//ipTree.insert(8, "test8");
//ipTree.insert(5, "test5");
//ipTree.insert(7, "test7");
//ipTree.insert(6, "test6");

//ipTree.traverse(function (key, value) {
//console.log("The value of " + key + " is " + value + ".");
//});

//console.log("Searching for 3 results in: " + ipTree.search(3));

//console.log("Min is " + ipTree.min());
//console.log("Max is " + ipTree.max());

//console.log("The successor of root is: " + ipTree.successor(ipTree.getRoot()));
//console.log("The predecessor of root is: " + ipTree.predecessor(ipTree.getRoot()));

