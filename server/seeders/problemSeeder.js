const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Problem = require('../models/Problem');
const { seedAchievements } = require('../services/achievementService');

const TOPICS = [
  { slug: 'arrays-hashing', name: 'Arrays & Hashing', description: 'Fundamental data structure operations using arrays and hash maps.', difficulty: 'Beginner', order: 1, icon: '📦', color: '#3b82f6', estimatedHours: 6 },
  { slug: 'two-pointers', name: 'Two Pointers', description: 'Efficient two-pointer technique for sorted arrays and linked lists.', difficulty: 'Beginner', order: 2, icon: '👆', color: '#06b6d4', estimatedHours: 4 },
  { slug: 'sliding-window', name: 'Sliding Window', description: 'Variable and fixed-size window techniques for subarray/substring problems.', difficulty: 'Intermediate', order: 3, icon: '🪟', color: '#8b5cf6', estimatedHours: 4 },
  { slug: 'stack', name: 'Stack', description: 'LIFO data structure for parsing, expression evaluation, and monotonic problems.', difficulty: 'Beginner', order: 4, icon: '📚', color: '#f59e0b', estimatedHours: 4 },
  { slug: 'binary-search', name: 'Binary Search', description: 'O(log n) search on sorted data and search space reduction.', difficulty: 'Intermediate', order: 5, icon: '🔍', color: '#10b981', estimatedHours: 5 },
  { slug: 'linked-list', name: 'Linked List', description: 'Pointer manipulation, reversal, and classic linked list problems.', difficulty: 'Intermediate', order: 6, icon: '🔗', color: '#ef4444', estimatedHours: 5 },
  { slug: 'trees', name: 'Trees', description: 'Binary trees, BSTs, traversals, and tree construction problems.', difficulty: 'Intermediate', order: 7, icon: '🌳', color: '#22c55e', estimatedHours: 8 },
  { slug: 'tries', name: 'Tries', description: 'Prefix tree data structure for efficient string searching.', difficulty: 'Advanced', order: 8, icon: '🔤', color: '#a78bfa', estimatedHours: 3 },
  { slug: 'heap-priority-queue', name: 'Heap / Priority Queue', description: 'Min/max heap operations and K-th element problems.', difficulty: 'Intermediate', order: 9, icon: '⛏️', color: '#fb923c', estimatedHours: 4 },
  { slug: 'backtracking', name: 'Backtracking', description: 'Recursive exploration of all possibilities with pruning.', difficulty: 'Advanced', order: 10, icon: '↩️', color: '#f43f5e', estimatedHours: 6 },
  { slug: 'graphs', name: 'Graphs', description: 'BFS, DFS, union-find, and classic graph traversal problems.', difficulty: 'Advanced', order: 11, icon: '🕸️', color: '#0ea5e9', estimatedHours: 8 },
  { slug: 'advanced-graphs', name: 'Advanced Graphs', description: 'Dijkstra, Bellman-Ford, topological sort, and minimum spanning tree.', difficulty: 'Advanced', order: 12, icon: '🗺️', color: '#6366f1', estimatedHours: 6 },
  { slug: '1d-dp', name: '1D Dynamic Programming', description: 'Memoization and tabulation for 1D state problems.', difficulty: 'Intermediate', order: 13, icon: '🧮', color: '#d946ef', estimatedHours: 7 },
  { slug: '2d-dp', name: '2D Dynamic Programming', description: 'Grid-based and matrix DP problems.', difficulty: 'Advanced', order: 14, icon: '🗄️', color: '#7c3aed', estimatedHours: 7 },
  { slug: 'greedy', name: 'Greedy', description: 'Locally optimal choice strategies for global optimization.', difficulty: 'Intermediate', order: 15, icon: '💰', color: '#f59e0b', estimatedHours: 4 },
  { slug: 'intervals', name: 'Intervals', description: 'Merging, inserting, and scheduling interval problems.', difficulty: 'Intermediate', order: 16, icon: '📏', color: '#14b8a6', estimatedHours: 3 },
  { slug: 'math-geometry', name: 'Math & Geometry', description: 'Mathematical algorithms and geometric problem solving.', difficulty: 'Intermediate', order: 17, icon: '📐', color: '#ec4899', estimatedHours: 4 },
  { slug: 'bit-manipulation', name: 'Bit Manipulation', description: 'Bitwise operations and bit tricks for efficient computation.', difficulty: 'Intermediate', order: 18, icon: '⚡', color: '#84cc16', estimatedHours: 3 },
];

const PROBLEMS_DATA = {
  'arrays-hashing': [
    { title: 'Contains Duplicate', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/contains-duplicate/', tags: ['Array', 'Hash Table', 'Sorting'], xpReward: 10, order: 1 },
    { title: 'Valid Anagram', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/', tags: ['Hash Table', 'String', 'Sorting'], xpReward: 10, order: 2 },
    { title: 'Two Sum', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/two-sum/', tags: ['Array', 'Hash Table'], xpReward: 10, order: 3 },
    { title: 'Group Anagrams', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/', tags: ['Array', 'Hash Table', 'String', 'Sorting'], xpReward: 20, order: 4 },
    { title: 'Top K Frequent Elements', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Sorting', 'Heap'], xpReward: 20, order: 5 },
    { title: 'Encode and Decode Strings', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/encode-and-decode-strings/', tags: ['Array', 'String', 'Design'], xpReward: 20, order: 6 },
    { title: 'Product of Array Except Self', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/', tags: ['Array', 'Prefix Sum'], xpReward: 20, order: 7 },
    { title: 'Valid Sudoku', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/valid-sudoku/', tags: ['Array', 'Hash Table', 'Matrix'], xpReward: 20, order: 8 },
    { title: 'Longest Consecutive Sequence', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/', tags: ['Array', 'Hash Table', 'Union Find'], xpReward: 20, order: 9 },
  ],
  'two-pointers': [
    { title: 'Valid Palindrome', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/', tags: ['Two Pointers', 'String'], xpReward: 10, order: 1 },
    { title: 'Two Sum II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/', tags: ['Array', 'Two Pointers', 'Binary Search'], xpReward: 20, order: 2 },
    { title: '3Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/3sum/', tags: ['Array', 'Two Pointers', 'Sorting'], xpReward: 20, order: 3 },
    { title: 'Container With Most Water', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/', tags: ['Array', 'Two Pointers', 'Greedy'], xpReward: 20, order: 4 },
    { title: 'Trapping Rain Water', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/', tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack', 'Monotonic Stack'], xpReward: 40, order: 5 },
  ],
  'sliding-window': [
    { title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', tags: ['Array', 'Dynamic Programming'], xpReward: 10, order: 1 },
    { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', tags: ['Hash Table', 'String', 'Sliding Window'], xpReward: 20, order: 2 },
    { title: 'Longest Repeating Character Replacement', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/', tags: ['Hash Table', 'String', 'Sliding Window'], xpReward: 20, order: 3 },
    { title: 'Permutation in String', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutation-in-string/', tags: ['Hash Table', 'Two Pointers', 'String', 'Sliding Window'], xpReward: 20, order: 4 },
    { title: 'Minimum Window Substring', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/', tags: ['Hash Table', 'String', 'Sliding Window'], xpReward: 40, order: 5 },
    { title: 'Sliding Window Maximum', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/', tags: ['Array', 'Queue', 'Sliding Window', 'Heap', 'Monotonic Queue'], xpReward: 40, order: 6 },
  ],
  'stack': [
    { title: 'Valid Parentheses', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/', tags: ['String', 'Stack'], xpReward: 10, order: 1 },
    { title: 'Min Stack', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/min-stack/', tags: ['Stack', 'Design'], xpReward: 20, order: 2 },
    { title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', tags: ['Array', 'Math', 'Stack'], xpReward: 20, order: 3 },
    { title: 'Generate Parentheses', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/generate-parentheses/', tags: ['String', 'Dynamic Programming', 'Backtracking'], xpReward: 20, order: 4 },
    { title: 'Daily Temperatures', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/daily-temperatures/', tags: ['Array', 'Stack', 'Monotonic Stack'], xpReward: 20, order: 5 },
    { title: 'Car Fleet', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/car-fleet/', tags: ['Array', 'Stack', 'Sorting', 'Monotonic Stack'], xpReward: 20, order: 6 },
    { title: 'Largest Rectangle in Histogram', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', tags: ['Array', 'Stack', 'Monotonic Stack'], xpReward: 40, order: 7 },
  ],
  'binary-search': [
    { title: 'Binary Search', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/binary-search/', tags: ['Array', 'Binary Search'], xpReward: 10, order: 1 },
    { title: 'Search a 2D Matrix', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/', tags: ['Array', 'Binary Search', 'Matrix'], xpReward: 20, order: 2 },
    { title: 'Koko Eating Bananas', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/', tags: ['Array', 'Binary Search'], xpReward: 20, order: 3 },
    { title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', tags: ['Array', 'Binary Search'], xpReward: 20, order: 4 },
    { title: 'Search in Rotated Sorted Array', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', tags: ['Array', 'Binary Search'], xpReward: 20, order: 5 },
    { title: 'Time Based Key-Value Store', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/', tags: ['Hash Table', 'String', 'Binary Search', 'Design'], xpReward: 20, order: 6 },
    { title: 'Median of Two Sorted Arrays', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', tags: ['Array', 'Binary Search', 'Divide and Conquer'], xpReward: 40, order: 7 },
  ],
  'linked-list': [
    { title: 'Reverse Linked List', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/', tags: ['Linked List', 'Recursion'], xpReward: 10, order: 1 },
    { title: 'Merge Two Sorted Lists', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', tags: ['Linked List', 'Recursion'], xpReward: 10, order: 2 },
    { title: 'Reorder List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/reorder-list/', tags: ['Linked List', 'Two Pointers', 'Stack', 'Recursion'], xpReward: 20, order: 3 },
    { title: 'Remove Nth Node From End of List', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', tags: ['Linked List', 'Two Pointers'], xpReward: 20, order: 4 },
    { title: 'Copy List with Random Pointer', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/', tags: ['Hash Table', 'Linked List'], xpReward: 20, order: 5 },
    { title: 'Add Two Numbers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/add-two-numbers/', tags: ['Linked List', 'Math', 'Recursion'], xpReward: 20, order: 6 },
    { title: 'Linked List Cycle', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/', tags: ['Hash Table', 'Linked List', 'Two Pointers'], xpReward: 10, order: 7 },
    { title: 'Find the Duplicate Number', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/', tags: ['Array', 'Two Pointers', 'Binary Search', 'Bit Manipulation'], xpReward: 20, order: 8 },
    { title: 'LRU Cache', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/lru-cache/', tags: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'], xpReward: 20, order: 9 },
    { title: 'Merge K Sorted Lists', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/', tags: ['Linked List', 'Divide and Conquer', 'Heap', 'Merge Sort'], xpReward: 40, order: 10 },
    { title: 'Reverse Nodes in k-Group', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', tags: ['Linked List', 'Recursion'], xpReward: 40, order: 11 },
  ],
  'trees': [
    { title: 'Invert Binary Tree', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/', tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'], xpReward: 10, order: 1 },
    { title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'], xpReward: 10, order: 2 },
    { title: 'Diameter of Binary Tree', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/', tags: ['Tree', 'DFS', 'Binary Tree'], xpReward: 10, order: 3 },
    { title: 'Balanced Binary Tree', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/balanced-binary-tree/', tags: ['Tree', 'DFS', 'Binary Tree'], xpReward: 10, order: 4 },
    { title: 'Same Tree', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/same-tree/', tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'], xpReward: 10, order: 5 },
    { title: 'Subtree of Another Tree', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/subtree-of-another-tree/', tags: ['Tree', 'DFS', 'String Matching', 'Binary Tree', 'Hash Function'], xpReward: 10, order: 6 },
    { title: 'Lowest Common Ancestor of BST', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', tags: ['Tree', 'DFS', 'Binary Search Tree', 'Binary Tree'], xpReward: 20, order: 7 },
    { title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', tags: ['Tree', 'BFS', 'Binary Tree'], xpReward: 20, order: 8 },
    { title: 'Binary Tree Right Side View', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/', tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'], xpReward: 20, order: 9 },
    { title: 'Count Good Nodes in Binary Tree', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/', tags: ['Tree', 'DFS', 'BFS', 'Binary Tree'], xpReward: 20, order: 10 },
    { title: 'Validate Binary Search Tree', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/', tags: ['Tree', 'DFS', 'Binary Search Tree', 'Binary Tree'], xpReward: 20, order: 11 },
    { title: 'Kth Smallest Element in BST', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', tags: ['Tree', 'DFS', 'Binary Search Tree', 'Binary Tree'], xpReward: 20, order: 12 },
    { title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', tags: ['Array', 'Hash Table', 'Divide and Conquer', 'Tree', 'Binary Tree'], xpReward: 20, order: 13 },
    { title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', tags: ['Dynamic Programming', 'Tree', 'DFS', 'Binary Tree'], xpReward: 40, order: 14 },
    { title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/', tags: ['String', 'Tree', 'DFS', 'BFS', 'Design', 'Binary Tree'], xpReward: 40, order: 15 },
  ],
  'tries': [
    { title: 'Implement Trie (Prefix Tree)', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/', tags: ['Hash Table', 'String', 'Design', 'Trie'], xpReward: 20, order: 1 },
    { title: 'Design Add and Search Words Data Structure', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', tags: ['String', 'DFS', 'Design', 'Trie'], xpReward: 20, order: 2 },
    { title: 'Word Search II', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/word-search-ii/', tags: ['Array', 'String', 'Backtracking', 'Trie', 'Matrix'], xpReward: 40, order: 3 },
  ],
  'heap-priority-queue': [
    { title: 'Kth Largest Element in a Stream', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/', tags: ['Tree', 'Design', 'Binary Search Tree', 'Heap', 'Binary Tree', 'Data Stream'], xpReward: 10, order: 1 },
    { title: 'Last Stone Weight', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/last-stone-weight/', tags: ['Array', 'Heap'], xpReward: 10, order: 2 },
    { title: 'K Closest Points to Origin', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/k-closest-points-to-origin/', tags: ['Array', 'Math', 'Divide and Conquer', 'Geometry', 'Sorting', 'Heap', 'Quickselect'], xpReward: 20, order: 3 },
    { title: 'Kth Largest Element in an Array', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', tags: ['Array', 'Divide and Conquer', 'Sorting', 'Heap', 'Quickselect'], xpReward: 20, order: 4 },
    { title: 'Task Scheduler', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/task-scheduler/', tags: ['Array', 'Hash Table', 'Greedy', 'Sorting', 'Heap', 'Counting'], xpReward: 20, order: 5 },
    { title: 'Design Twitter', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/design-twitter/', tags: ['Hash Table', 'Linked List', 'Design', 'Heap'], xpReward: 20, order: 6 },
    { title: 'Find Median from Data Stream', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/', tags: ['Two Pointers', 'Design', 'Sorting', 'Heap', 'Data Stream'], xpReward: 40, order: 7 },
  ],
  'backtracking': [
    { title: 'Subsets', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/subsets/', tags: ['Array', 'Backtracking', 'Bit Manipulation'], xpReward: 20, order: 1 },
    { title: 'Combination Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum/', tags: ['Array', 'Backtracking'], xpReward: 20, order: 2 },
    { title: 'Combination Sum II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum-ii/', tags: ['Array', 'Backtracking'], xpReward: 20, order: 3 },
    { title: 'Permutations', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutations/', tags: ['Array', 'Backtracking'], xpReward: 20, order: 4 },
    { title: 'Subsets II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/subsets-ii/', tags: ['Array', 'Backtracking', 'Bit Manipulation'], xpReward: 20, order: 5 },
    { title: 'Word Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/word-search/', tags: ['Array', 'String', 'Backtracking', 'Matrix'], xpReward: 20, order: 6 },
    { title: 'Palindrome Partitioning', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/palindrome-partitioning/', tags: ['String', 'Dynamic Programming', 'Backtracking'], xpReward: 20, order: 7 },
    { title: 'Letter Combinations of a Phone Number', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', tags: ['Hash Table', 'String', 'Backtracking'], xpReward: 20, order: 8 },
    { title: 'N-Queens', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/n-queens/', tags: ['Array', 'Backtracking'], xpReward: 40, order: 9 },
  ],
  'graphs': [
    { title: 'Number of Islands', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/', tags: ['Array', 'DFS', 'BFS', 'Union Find', 'Matrix'], xpReward: 20, order: 1 },
    { title: 'Clone Graph', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/clone-graph/', tags: ['Hash Table', 'DFS', 'BFS', 'Graph'], xpReward: 20, order: 2 },
    { title: 'Max Area of Island', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/max-area-of-island/', tags: ['Array', 'DFS', 'BFS', 'Union Find', 'Matrix'], xpReward: 20, order: 3 },
    { title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', tags: ['Array', 'DFS', 'BFS', 'Matrix'], xpReward: 20, order: 4 },
    { title: 'Surrounded Regions', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/surrounded-regions/', tags: ['Array', 'DFS', 'BFS', 'Union Find', 'Matrix'], xpReward: 20, order: 5 },
    { title: 'Rotting Oranges', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/rotting-oranges/', tags: ['Array', 'BFS', 'Matrix'], xpReward: 20, order: 6 },
    { title: 'Walls and Gates', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/walls-and-gates/', tags: ['Array', 'BFS', 'Matrix'], xpReward: 20, order: 7 },
    { title: 'Course Schedule', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/course-schedule/', tags: ['DFS', 'BFS', 'Graph', 'Topological Sort'], xpReward: 20, order: 8 },
    { title: 'Course Schedule II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/course-schedule-ii/', tags: ['DFS', 'BFS', 'Graph', 'Topological Sort'], xpReward: 20, order: 9 },
    { title: 'Graph Valid Tree', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/graph-valid-tree/', tags: ['DFS', 'BFS', 'Union Find', 'Graph'], xpReward: 20, order: 10 },
    { title: 'Number of Connected Components in an Undirected Graph', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/', tags: ['DFS', 'BFS', 'Union Find', 'Graph'], xpReward: 20, order: 11 },
    { title: 'Redundant Connection', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/redundant-connection/', tags: ['DFS', 'BFS', 'Union Find', 'Graph'], xpReward: 20, order: 12 },
    { title: 'Word Ladder', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/word-ladder/', tags: ['Hash Table', 'String', 'BFS'], xpReward: 40, order: 13 },
  ],
  'advanced-graphs': [
    { title: 'Reconstruct Itinerary', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/reconstruct-itinerary/', tags: ['DFS', 'Graph', 'Eulerian Circuit'], xpReward: 40, order: 1 },
    { title: 'Min Cost to Connect All Points', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/min-cost-to-connect-all-points/', tags: ['Array', 'Union Find', 'Graph', 'Minimum Spanning Tree'], xpReward: 20, order: 2 },
    { title: 'Network Delay Time', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/network-delay-time/', tags: ['DFS', 'BFS', 'Graph', 'Heap', 'Shortest Path'], xpReward: 20, order: 3 },
    { title: 'Swim in Rising Water', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/swim-in-rising-water/', tags: ['Array', 'Binary Search', 'DFS', 'BFS', 'Union Find', 'Heap', 'Matrix'], xpReward: 40, order: 4 },
    { title: 'Alien Dictionary', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/alien-dictionary/', tags: ['Array', 'String', 'DFS', 'BFS', 'Graph', 'Topological Sort'], xpReward: 40, order: 5 },
    { title: 'Cheapest Flights Within K Stops', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/', tags: ['Dynamic Programming', 'DFS', 'BFS', 'Graph', 'Heap', 'Shortest Path'], xpReward: 20, order: 6 },
  ],
  '1d-dp': [
    { title: 'Climbing Stairs', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/', tags: ['Math', 'Dynamic Programming', 'Memoization'], xpReward: 10, order: 1 },
    { title: 'Min Cost Climbing Stairs', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/min-cost-climbing-stairs/', tags: ['Array', 'Dynamic Programming'], xpReward: 10, order: 2 },
    { title: 'House Robber', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/house-robber/', tags: ['Array', 'Dynamic Programming'], xpReward: 20, order: 3 },
    { title: 'House Robber II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/house-robber-ii/', tags: ['Array', 'Dynamic Programming'], xpReward: 20, order: 4 },
    { title: 'Longest Palindromic Substring', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-palindromic-substring/', tags: ['String', 'Dynamic Programming'], xpReward: 20, order: 5 },
    { title: 'Palindromic Substrings', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/palindromic-substrings/', tags: ['String', 'Dynamic Programming'], xpReward: 20, order: 6 },
    { title: 'Decode Ways', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/decode-ways/', tags: ['String', 'Dynamic Programming'], xpReward: 20, order: 7 },
    { title: 'Coin Change', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/coin-change/', tags: ['Array', 'Dynamic Programming', 'BFS'], xpReward: 20, order: 8 },
    { title: 'Maximum Product Subarray', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/maximum-product-subarray/', tags: ['Array', 'Dynamic Programming'], xpReward: 20, order: 9 },
    { title: 'Word Break', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/word-break/', tags: ['Hash Table', 'String', 'Dynamic Programming', 'Trie', 'Memoization'], xpReward: 20, order: 10 },
    { title: 'Longest Increasing Subsequence', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/', tags: ['Array', 'Binary Search', 'Dynamic Programming'], xpReward: 20, order: 11 },
    { title: 'Partition Equal Subset Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/', tags: ['Array', 'Dynamic Programming'], xpReward: 20, order: 12 },
  ],
  '2d-dp': [
    { title: 'Unique Paths', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/unique-paths/', tags: ['Math', 'Dynamic Programming', 'Combinatorics'], xpReward: 20, order: 1 },
    { title: 'Longest Common Subsequence', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/', tags: ['String', 'Dynamic Programming'], xpReward: 20, order: 2 },
    { title: 'Best Time to Buy and Sell Stock with Cooldown', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/', tags: ['Array', 'Dynamic Programming'], xpReward: 20, order: 3 },
    { title: 'Coin Change II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/coin-change-ii/', tags: ['Array', 'Dynamic Programming'], xpReward: 20, order: 4 },
    { title: 'Target Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/target-sum/', tags: ['Array', 'Dynamic Programming', 'Backtracking'], xpReward: 20, order: 5 },
    { title: 'Interleaving String', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/interleaving-string/', tags: ['String', 'Dynamic Programming'], xpReward: 20, order: 6 },
    { title: 'Longest Increasing Path in a Matrix', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/', tags: ['Array', 'Dynamic Programming', 'DFS', 'BFS', 'Graph', 'Topological Sort', 'Memoization', 'Matrix'], xpReward: 40, order: 7 },
    { title: 'Distinct Subsequences', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/distinct-subsequences/', tags: ['String', 'Dynamic Programming'], xpReward: 40, order: 8 },
    { title: 'Edit Distance', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/edit-distance/', tags: ['String', 'Dynamic Programming'], xpReward: 20, order: 9 },
    { title: 'Burst Balloons', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/burst-balloons/', tags: ['Array', 'Dynamic Programming'], xpReward: 40, order: 10 },
    { title: 'Regular Expression Matching', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/regular-expression-matching/', tags: ['String', 'Dynamic Programming', 'Recursion'], xpReward: 40, order: 11 },
  ],
  'greedy': [
    { title: 'Maximum Subarray', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/', tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'], xpReward: 20, order: 1 },
    { title: 'Jump Game', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/jump-game/', tags: ['Array', 'Dynamic Programming', 'Greedy'], xpReward: 20, order: 2 },
    { title: 'Jump Game II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/jump-game-ii/', tags: ['Array', 'Dynamic Programming', 'Greedy'], xpReward: 20, order: 3 },
    { title: 'Gas Station', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/gas-station/', tags: ['Array', 'Greedy'], xpReward: 20, order: 4 },
    { title: 'Hand of Straights', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/hand-of-straights/', tags: ['Array', 'Hash Table', 'Greedy', 'Sorting'], xpReward: 20, order: 5 },
    { title: 'Merge Triplets to Form Target Triplet', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/merge-triplets-to-form-target-triplet/', tags: ['Array', 'Greedy'], xpReward: 20, order: 6 },
    { title: 'Partition Labels', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/partition-labels/', tags: ['Hash Table', 'Two Pointers', 'String', 'Greedy'], xpReward: 20, order: 7 },
    { title: 'Valid Parenthesis String', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/valid-parenthesis-string/', tags: ['String', 'Dynamic Programming', 'Stack', 'Greedy'], xpReward: 20, order: 8 },
  ],
  'intervals': [
    { title: 'Insert Interval', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/insert-interval/', tags: ['Array'], xpReward: 20, order: 1 },
    { title: 'Merge Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/', tags: ['Array', 'Sorting'], xpReward: 20, order: 2 },
    { title: 'Non-overlapping Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/', tags: ['Array', 'Dynamic Programming', 'Greedy', 'Sorting'], xpReward: 20, order: 3 },
    { title: 'Meeting Rooms', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms/', tags: ['Array', 'Sorting'], xpReward: 10, order: 4 },
    { title: 'Meeting Rooms II', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/', tags: ['Array', 'Two Pointers', 'Greedy', 'Sorting', 'Heap', 'Prefix Sum'], xpReward: 20, order: 5 },
    { title: 'Minimum Interval to Include Each Query', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/minimum-interval-to-include-each-query/', tags: ['Array', 'Binary Search', 'Line Sweep', 'Sorting', 'Heap'], xpReward: 40, order: 6 },
  ],
  'math-geometry': [
    { title: 'Rotate Image', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/rotate-image/', tags: ['Array', 'Math', 'Matrix'], xpReward: 20, order: 1 },
    { title: 'Spiral Matrix', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/spiral-matrix/', tags: ['Array', 'Matrix', 'Simulation'], xpReward: 20, order: 2 },
    { title: 'Set Matrix Zeroes', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/set-matrix-zeroes/', tags: ['Array', 'Hash Table', 'Matrix'], xpReward: 20, order: 3 },
    { title: 'Happy Number', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/happy-number/', tags: ['Hash Table', 'Math', 'Two Pointers'], xpReward: 10, order: 4 },
    { title: 'Plus One', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/plus-one/', tags: ['Array', 'Math'], xpReward: 10, order: 5 },
    { title: 'Pow(x, n)', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/powx-n/', tags: ['Math', 'Recursion'], xpReward: 20, order: 6 },
    { title: 'Multiply Strings', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/multiply-strings/', tags: ['Math', 'String', 'Simulation'], xpReward: 20, order: 7 },
    { title: 'Detect Squares', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/detect-squares/', tags: ['Array', 'Hash Table', 'Design', 'Counting'], xpReward: 20, order: 8 },
  ],
  'bit-manipulation': [
    { title: 'Single Number', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/single-number/', tags: ['Array', 'Bit Manipulation'], xpReward: 10, order: 1 },
    { title: 'Number of 1 Bits', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/number-of-1-bits/', tags: ['Divide and Conquer', 'Bit Manipulation'], xpReward: 10, order: 2 },
    { title: 'Counting Bits', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/counting-bits/', tags: ['Dynamic Programming', 'Bit Manipulation'], xpReward: 10, order: 3 },
    { title: 'Reverse Bits', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/reverse-bits/', tags: ['Divide and Conquer', 'Bit Manipulation'], xpReward: 10, order: 4 },
    { title: 'Missing Number', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/missing-number/', tags: ['Array', 'Hash Table', 'Math', 'Binary Search', 'Bit Manipulation', 'Sorting'], xpReward: 10, order: 5 },
    { title: 'Sum of Two Integers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/sum-of-two-integers/', tags: ['Math', 'Bit Manipulation'], xpReward: 20, order: 6 },
    { title: 'Reverse Integer', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/reverse-integer/', tags: ['Math'], xpReward: 20, order: 7 },
  ],
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Seed topics
    console.log('🌱 Seeding topics...');
    const topicMap = {};
    for (const topicData of TOPICS) {
      const topic = await Topic.findOneAndUpdate(
        { slug: topicData.slug },
        topicData,
        { upsert: true, new: true }
      );
      topicMap[topicData.slug] = topic;
      console.log(`  ✓ Topic: ${topic.name}`);
    }

    // Seed problems
    console.log('🌱 Seeding problems...');
    let totalProblems = 0;
    for (const [topicSlug, problems] of Object.entries(PROBLEMS_DATA)) {
      const topic = topicMap[topicSlug];
      if (!topic) continue;

      for (const problemData of problems) {
        const slug = problemData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        await Problem.findOneAndUpdate(
          { slug },
          {
            ...problemData,
            slug,
            topicId: topic._id,
            topicSlug: topic.slug,
            topicName: topic.name,
          },
          { upsert: true, new: true }
        );
        totalProblems++;
      }

      // Update topic problem count
      const count = await Problem.countDocuments({ topicId: topic._id, isActive: true });
      await Topic.findByIdAndUpdate(topic._id, { problemCount: count });
      console.log(`  ✓ ${topic.name}: ${problems.length} problems`);
    }

    // Seed achievements
    console.log('🌱 Seeding achievements...');
    await seedAchievements();

    console.log(`\n✅ Seeding complete! Topics: ${TOPICS.length}, Problems: ${totalProblems}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seed();
