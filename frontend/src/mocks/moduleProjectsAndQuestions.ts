export interface CapstoneProject {
  title: string;
  description: string;
  deliverables: string[];
  proofOfMastery: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  keyConcepts: string[];
}

export interface ModulePracticalGuide {
  project: CapstoneProject;
  interviewQuestions: InterviewQuestion[];
}

export const PRACTICAL_GUIDES: Record<string, ModulePracticalGuide> = {
  skill_git: {
    project: {
      title: "Enterprise Monorepo Branching & GitHub Actions CI Workflow",
      description: "Design and implement a production-grade Git collaboration workflow simulating a team releasing software with zero downtime.",
      deliverables: [
        "Initialize a multi-package repository with branch protection rules on main",
        "Simulate an agile release flow with feature branches, interactive rebasing, and squash merges",
        "Configure an automated GitHub Actions CI pipeline running linting, formatting, and unit tests",
        "Tag and publish semantic version releases (v1.0.0) with automated changelog generation"
      ],
      proofOfMastery: "Public GitHub repository with clean commit history, closed pull requests demonstrating code review, and passing green CI badge."
    },
    interviewQuestions: [
      {
        id: "git_q1",
        question: "What is the fundamental difference between 'git merge' and 'git rebase', and when should you avoid rebasing?",
        answer: "'git merge' creates a new commit that ties together the histories of two branches, preserving the exact chronological sequence. 'git rebase' rewrites commit history by moving your feature branch to begin at the tip of the target branch, producing a clean, linear history. GOLDEN RULE: Never rebase a public branch that other developers have pulled, as rewriting shared commits causes synchronization divergence.",
        keyConcepts: ["Fast-forward merge", "Linear history", "Shared branch rule", "Commit hash rewriting"]
      },
      {
        id: "git_q2",
        question: "How does Git internally store data (Blobs, Trees, Commits)?",
        answer: "Git is a content-addressable filesystem. Every object is identified by its SHA-1/SHA-256 hash. 'Blobs' store raw file contents (without filenames or permissions). 'Trees' represent directories, mapping filenames to blob hashes or sub-tree hashes. 'Commits' hold metadata (author, committer, timestamp, message) and point to a root Tree object and zero or more parent commit hashes.",
        keyConcepts: ["Content-addressable storage", "SHA hash integrity", "Directed Acyclic Graph (DAG)", "Objects directory (.git/objects)"]
      },
      {
        id: "git_q3",
        question: "Explain the differences between 'git reset --soft', '--mixed', and '--hard'.",
        answer: "'--soft' moves HEAD to the target commit, leaving changes in the Staging Index and Working Directory untouched. '--mixed' (default) moves HEAD and unstages changes from the Index, leaving them only in the Working Directory. '--hard' moves HEAD and resets BOTH the Index and the Working Directory, permanently discarding uncommitted changes.",
        keyConcepts: ["Three trees (HEAD, Index, Working Dir)", "Destructive vs Non-destructive reset", "git reflog recovery"]
      },
      {
        id: "git_q4",
        question: "What is a 'detached HEAD' state in Git and how do you recover uncommitted work from it?",
        answer: "A detached HEAD occurs when HEAD points directly to a specific commit hash rather than a named branch reference. New commits made in this state are not associated with any branch and risk being garbage-collected. To preserve work created in a detached HEAD state, create a new branch pointing to the current commit: 'git switch -c new-feature-branch'.",
        keyConcepts: ["Branch refs vs direct commit pointers", "Garbage collection (git gc)", "git switch -c"]
      },
      {
        id: "git_q5",
        question: "How do Git Hooks work and how do pre-commit hooks prevent faulty code from reaching remote repositories?",
        answer: "Git Hooks are executable scripts stored in '.git/hooks' that run automatically at key lifecycle events (e.g. pre-commit, pre-push, commit-msg). A 'pre-commit' hook executes before a commit is finalized; if the script exits with a non-zero code (due to linter errors, failing type checks, or security token leaks), Git halts the commit process, guaranteeing clean commits.",
        keyConcepts: ["Client-side hooks", "Husky / lint-staged", "Exit code gates", "Automated code quality"]
      }
    ]
  },

  skill_postgresql: {
    project: {
      title: "High-Throughput E-Commerce Schema & Query Optimization Benchmark",
      description: "Architect a normalized relational database schema in PostgreSQL capable of supporting 100k+ orders with sub-10ms query execution times.",
      deliverables: [
        "Design 3NF schema for users, orders, items, products, and categories with foreign key constraints",
        "Implement composite B-Tree indexes and GIN indexes for fast full-text product search",
        "Benchmark query execution plans using 'EXPLAIN (ANALYZE, BUFFERS)' on a 100,000-row dataset",
        "Implement ACID transactions with row-level advisory locks ('SELECT ... FOR UPDATE') to prevent inventory double-spending"
      ],
      proofOfMastery: "SQL migration scripts, seed data generator, and documented query optimization report comparing sequential vs index scan execution costs."
    },
    interviewQuestions: [
      {
        id: "pg_q1",
        question: "How does PostgreSQL's MVCC (Multi-Version Concurrency Control) work and why is VACUUM necessary?",
        answer: "MVCC allows concurrent reads and writes without locking tables. When a row is updated or deleted, PostgreSQL does not overwrite the disk space immediately; it writes a new version with updated xmin/xmax transaction visibility headers. The old version becomes a 'dead tuple'. The VACUUM command reclaims the space occupied by dead tuples and prevents transaction ID wraparound.",
        keyConcepts: ["Dead tuples", "xmin/xmax headers", "Autovacuum daemon", "Table bloat prevention"]
      },
      {
        id: "pg_q2",
        question: "What is the difference between B-Tree, Hash, and GIN indexes in PostgreSQL?",
        answer: "B-Tree is the default, self-balancing index ideal for equality and range queries (<, <=, =, >=, >) and sorting (ORDER BY). Hash indexes only support simple equality operators (=). GIN (Generalized Inverted Index) is designed for composite multi-value attributes where an item has multiple elements (e.g., JSONB keys, array elements, and full-text search tsvector).",
        keyConcepts: ["B-Tree range scans", "GIN inverted indexes", "JSONB indexing", "Index selectivity"]
      },
      {
        id: "pg_q3",
        question: "Explain the 4 SQL Transaction Isolation Levels and what concurrency anomalies they prevent.",
        answer: "The levels are: 1. Read Uncommitted (allows dirty reads in theory, though Postgres treats it as Read Committed). 2. Read Committed (default; prevents dirty reads, allows non-repeatable reads). 3. Repeatable Read (prevents dirty reads and non-repeatable reads using snapshot isolation). 4. Serializable (strictest; prevents all anomalies including phantom reads and write skew by tracking dependencies).",
        keyConcepts: ["Dirty read", "Non-repeatable read", "Phantom read", "Snapshot isolation", "Write skew"]
      },
      {
        id: "pg_q4",
        question: "How do you analyze and optimize a slow query using 'EXPLAIN (ANALYZE, BUFFERS)'?",
        answer: "Look for: 1. 'Seq Scan' on large tables (missing index). 2. Discrepancy between Estimated Rows and Actual Rows (indicates stale statistics; run ANALYZE). 3. 'Shared Read' blocks in Buffers (data fetched from slow disk rather than cache). 4. High 'Sort Method: external merge Disk' (increase work_mem). Fix by adding partial/composite indexes and rewriting inefficient subqueries.",
        keyConcepts: ["Cost metrics", "Index Scan vs Bitmap Scan", "work_mem tuning", "Buffer cache hit ratio"]
      },
      {
        id: "pg_q5",
        question: "What is the difference between WHERE and HAVING clauses, and how do Window Functions execute?",
        answer: "WHERE filters individual rows BEFORE aggregation occurs and cannot use aggregate functions. HAVING filters aggregated groups AFTER the GROUP BY clause has executed. Window Functions (e.g., ROW_NUMBER(), RANK(), SUM() OVER (PARTITION BY ...)) perform calculations across a set of table rows related to the current row without collapsing rows like GROUP BY does.",
        keyConcepts: ["Row filtering vs Group filtering", "OVER clause", "PARTITION BY", "SQL execution order"]
      }
    ]
  },

  skill_typescript: {
    project: {
      title: "Type-Safe API SDK & Runtime Schema Validation Library",
      description: "Build a production-grade TypeScript client library featuring exhaustive Discriminated Unions, mapped types, and Zod runtime payload validation.",
      deliverables: [
        "Design generic API response envelopes with Discriminated Unions (Success vs Error states)",
        "Implement recursive deep mapped utility types ('DeepReadonly<T>', 'DeepPartial<T>')",
        "Integrate Zod schema parsing to guarantee incoming untyped HTTP payloads match compile-time types",
        "Configure strict tsconfig settings ('strict: true', 'noImplicitAny', 'noUncheckedIndexedAccess')"
      ],
      proofOfMastery: "Published npm/git package with comprehensive type-level tests ('tsd') confirming zero 'any' escape hatches."
    },
    interviewQuestions: [
      {
        id: "ts_q1",
        question: "What is the difference between 'interface' and 'type' in TypeScript?",
        answer: "'interface' is extendable and supports Declaration Merging (multiple declarations with the same name merge their properties), making it ideal for public library APIs. 'type' aliases can represent primitives, unions ('A | B'), intersections ('A & B'), and mapped types. Modern TypeScript compiles both identically, but interfaces are generally preferred for object shape contracts.",
        keyConcepts: ["Declaration merging", "Union types", "Intersection types", "Mapped types"]
      },
      {
        id: "ts_q2",
        question: "What are Discriminated Unions and how do you implement exhaustive type checking?",
        answer: "A Discriminated Union is a union of object types that share a common literal property (the 'discriminant', e.g., 'type: \"success\" | \"error\"'). In a switch statement, TypeScript narrows the type automatically. To ensure exhaustive matching, add a default case that assigns the value to 'never': 'const _exhaustive: never = action;'. If a new union member is added later, compilation fails immediately.",
        keyConcepts: ["Discriminant tag", "Control flow analysis", "Exhaustive check with never", "Type narrowing"]
      },
      {
        id: "ts_q3",
        question: "How do 'any', 'unknown', and 'never' differ in TypeScript's type system?",
        answer: "'any' disables type checking completely (escape hatch). 'unknown' is the type-safe counterpart of any (top type); you cannot access properties or call methods on an unknown value until you narrow its type with 'typeof', 'instanceof', or a type guard. 'never' represents values that can never occur (bottom type), such as functions that throw errors or exhaustive switch defaults.",
        keyConcepts: ["Top type vs Bottom type", "Type safety", "Type narrowing", "Defensive programming"]
      },
      {
        id: "ts_q4",
        question: "Explain Generics with constraints using 'extends' and 'keyof'.",
        answer: "Generics provide reusable code that works over a variety of types. Constraints restrict the acceptable types: 'function getProp<T, K extends keyof T>(obj: T, key: K): T[K]'. Here, 'keyof T' produces the union of keys in T, and 'K extends keyof T' guarantees that key K is a valid property on T, returning the exact property type T[K].",
        keyConcepts: ["Type parameter bounds", "keyof operator", "Lookup types (T[K])", "Type inference"]
      },
      {
        id: "ts_q5",
        question: "What are TypeScript Utility Types and how do 'Partial<T>' and 'Omit<T, K>' work internally?",
        answer: "'Partial<T>' is implemented using mapped types: '{ [P in keyof T]?: T[P] }', making every key optional. 'Omit<T, K>' removes keys K from T and is implemented using Pick and Exclude: 'Pick<T, Exclude<keyof T, K>>'. Exclude uses conditional types: 'T extends U ? never : T'.",
        keyConcepts: ["Mapped types", "Conditional types", "Exclude & Pick", "Utility types"]
      }
    ]
  },

  skill_react: {
    project: {
      title: "Real-Time Collaborative Kanban Dashboard with Custom Hooks & State Machine",
      description: "Build an interactive drag-and-drop dashboard featuring optimistic updates, responsive component trees, and zero unnecessary re-renders.",
      deliverables: [
        "Implement drag-and-drop card movements with optimistic UI and rollback on network failure",
        "Create reusable custom hooks ('useWebSocketSync', 'useDebouncedValue', 'useLocalStorage')",
        "Optimize render cycles using React Profiler, 'React.memo', 'useMemo', and 'useCallback'",
        "Architect clean global state with Context API and useReducer without context-hell performance leaks"
      ],
      proofOfMastery: "Interactive responsive web app deployed on Vercel with automated test coverage in Vitest and React Testing Library."
    },
    interviewQuestions: [
      {
        id: "react_q1",
        question: "How does React's Fiber Reconciliation algorithm work under the hood?",
        answer: "React Fiber is a complete rewrite of React's core reconciliation engine. It breaks rendering into units of work (Fiber nodes). It operates in two phases: 1. Render/Reconciliation Phase (asynchronous, interruptible): React builds a work-in-progress fiber tree and calculates differences (diffing). 2. Commit Phase (synchronous): React applies changes to the actual DOM in one atomic operation.",
        keyConcepts: ["Fiber node tree", "Render phase vs Commit phase", "Time-slicing", "Concurrent React"]
      },
      {
        id: "react_q2",
        question: "What are the Rules of Hooks and why must Hooks execute in the exact same order on every render?",
        answer: "Rules: 1. Only call Hooks at the top level (never inside loops, conditions, or nested functions). 2. Only call Hooks from React function components or custom Hooks. Reason: React relies on the call order to preserve hook state across renders using an internal singly-linked list on the Fiber node. If a condition skips a hook, the pointer shifts, corrupting all subsequent state.",
        keyConcepts: ["Linked-list state storage", "Hook call order invariant", "Fiber memoizedState", "Linting rules"]
      },
      {
        id: "react_q3",
        question: "How do you diagnose and eliminate unnecessary component re-renders?",
        answer: "Diagnose using React DevTools Profiler ('Highlight updates when components render'). Fixes: 1. Memoize pure presentation components with 'React.memo'. 2. Wrap object/array definitions passed as props in 'useMemo'. 3. Wrap callback handlers passed to memoized children in 'useCallback'. 4. Move state down closer to where it is used. 5. Split large Contexts into separate values and setters.",
        keyConcepts: ["Reference equality", "React.memo", "useMemo & useCallback", "Context splitting"]
      },
      {
        id: "react_q4",
        question: "What is the difference between 'useEffect', 'useLayoutEffect', and 'useInsertionEffect'?",
        answer: "'useEffect' runs asynchronously AFTER the browser has painted the screen (ideal for data fetching and subscriptions). 'useLayoutEffect' runs synchronously immediately after DOM mutations but BEFORE browser paint (used for reading layout geometry and avoiding visual flicker). 'useInsertionEffect' runs before DOM mutations (specifically created for CSS-in-JS libraries to inject style tags).",
        keyConcepts: ["Browser paint pipeline", "Visual flicker prevention", "Synchronous vs Asynchronous", "Layout measurement"]
      },
      {
        id: "react_q5",
        question: "How does React 18 Concurrent Rendering and Suspense work?",
        answer: "Concurrent Rendering allows React to pause, resume, or discard render calculations to keep the UI responsive to user input. 'useTransition' marks state updates as non-urgent transitions that yield to urgent events (like keystrokes). 'Suspense' coordinates loading states by catching thrown Promises from data sources and displaying fallback UI until the Promise resolves.",
        keyConcepts: ["useTransition", "startTransition", "Suspense boundaries", "Non-blocking UI updates"]
      }
    ]
  },

  skill_nodejs: {
    project: {
      title: "Scalable Production REST API with JWT Auth, Rate Limiting & Redis Caching",
      description: "Engineer a high-throughput backend service in Node.js/Express with robust middleware, security headers, and Redis caching.",
      deliverables: [
        "Architect clean 3-tier structure (Routes -> Controllers -> Services -> Repositories)",
        "Implement JWT authentication with httpOnly cookie refresh token rotation",
        "Add Redis sliding-window rate limiting middleware to prevent brute force attacks",
        "Configure centralized error handling, structured Winston logging, and OpenAPI 3.0 Swagger docs"
      ],
      proofOfMastery: "Production-ready containerized Node.js API with automated test suite and k6 load testing report proving 500+ req/sec capacity."
    },
    interviewQuestions: [
      {
        id: "node_q1",
        question: "Explain the phases of the Node.js Event Loop.",
        answer: "The Event Loop executes in 6 phases: 1. Timers (executes callbacks from setTimeout/setInterval). 2. Pending Callbacks (executes I/O callbacks deferred from previous loops). 3. Idle/Prepare (internal). 4. Poll (retrieves new I/O events, executes I/O callbacks). 5. Check (executes setImmediate callbacks). 6. Close Callbacks (executes socket close handlers). Microtasks (process.nextTick, Promise callbacks) run between every phase.",
        keyConcepts: ["Timers phase", "Poll phase", "Check phase", "Microtask priority queue"]
      },
      {
        id: "node_q2",
        question: "What is the difference between 'process.nextTick()' and 'setImmediate()'?",
        answer: "'process.nextTick()' is part of the microtask queue and runs immediately after the current synchronous JavaScript operation completes, before the event loop advances to the next phase. 'setImmediate()' is scheduled in the Check phase of the event loop. Overusing nextTick can starve the I/O event loop.",
        keyConcepts: ["Microtask vs Macrotask", "Event loop starvation", "Execution order priority"]
      },
      {
        id: "node_q3",
        question: "How do Streams and Buffers prevent Node.js Out-Of-Memory (OOM) crashes when processing large files?",
        answer: "Buffers represent raw chunks of binary memory allocated outside the V8 heap. Streams process data chunk-by-chunk over time rather than loading an entire 2GB file into RAM. Piping streams ('pipeline(readStream, transformStream, writeStream)') automatically handles 'backpressure' (pausing the read stream if the write stream buffer is full).",
        keyConcepts: ["Chunked processing", "Backpressure handling", "pipeline() utility", "Buffer vs String RAM usage"]
      },
      {
        id: "node_q4",
        question: "How do you scale a single-threaded Node.js application to utilize multi-core server hardware?",
        answer: "1. Node.js Cluster Module: Forks multiple worker processes sharing the same server port using round-robin load distribution. 2. Process Managers: Use PM2 in cluster mode to automatically spawn instances matching CPU core count. 3. Worker Threads: For CPU-bound tasks (encryption, image compression) within the same process. 4. Horizontal Pod Autoscaling in Kubernetes.",
        keyConcepts: ["Cluster module", "Worker threads", "PM2 cluster mode", "Multi-core utilization"]
      },
      {
        id: "node_q5",
        question: "What security measures are required to protect a Node.js REST API in production?",
        answer: "1. Helmet middleware to set secure HTTP response headers (HSTS, CSP, X-Frame-Options). 2. Rate limiting (express-rate-limit + Redis) against DoS. 3. Parameterized database queries to prevent SQL injection. 4. CORS configuration with explicit origin whitelists. 5. Storing refresh tokens in httpOnly, SameSite=Strict cookies to mitigate XSS and CSRF.",
        keyConcepts: ["OWASP Top 10", "Helmet headers", "Rate limiting", "httpOnly cookies", "Parameterized queries"]
      }
    ]
  },

  skill_nextjs: {
    project: {
      title: "Full-Stack Server-Rendered E-Commerce Application with App Router",
      description: "Build an end-to-end web application with Next.js 14 utilizing React Server Components, Server Actions, and dynamic Edge caching.",
      deliverables: [
        "Develop product catalog with Server Components (RSC) and parallel modal route previews",
        "Implement cart and checkout mutations using Server Actions with optimistic UI updates",
        "Configure fine-grained Next.js caching layers ('revalidatePath', 'revalidateTag', Data Cache)",
        "Implement Edge Middleware for session verification and protected route gating"
      ],
      proofOfMastery: "Deployed full-stack Next.js project achieving 95+ Google Lighthouse scores across Performance, Accessibility, and Best Practices."
    },
    interviewQuestions: [
      {
        id: "next_q1",
        question: "What is the architectural difference between React Server Components (RSC) and Client Components in Next.js?",
        answer: "Server Components execute ONLY on the server during the build or request time; their code and dependencies are never shipped to the browser, reducing JavaScript bundle size to zero. Client Components ('\"use client\"') are rendered on the server into HTML and then hydrated in the browser, allowing access to hooks (useState, useEffect) and event listeners (onClick).",
        keyConcepts: ["Zero client bundle size", "\"use client\" boundary", "Server-side data fetching", "Hydration"]
      },
      {
        id: "next_q2",
        question: "Explain the 4 caching mechanisms in Next.js 14 App Router.",
        answer: "1. Request Memoization: Deduplicates identical GET fetch requests during a single render cycle. 2. Data Cache: Persists fetch results across user requests and server deployments until revalidated. 3. Full Route Cache: Caches static HTML and RSC payloads on the server at build time. 4. Router Cache: In-memory client-side cache storing visited route segments during the user's browser session.",
        keyConcepts: ["Request memoization", "Data Cache", "Full Route Cache", "revalidateTag & revalidatePath"]
      },
      {
        id: "next_q3",
        question: "What are Server Actions and how do they replace traditional REST API endpoints in Next.js?",
        answer: "Server Actions are asynchronous functions defined on the server with '\"use server\"' that can be invoked directly from Client Components or HTML forms. Next.js handles the POST request, serialization, and mutation under the hood. They seamlessly integrate with 'revalidatePath' to trigger automatic UI re-renders without needing manual client-side refetch logic.",
        keyConcepts: ["\"use server\" directive", "Progressive enhancement", "RPC execution", "Automatic cache revalidation"]
      },
      {
        id: "next_q4",
        question: "What is Incremental Static Regeneration (ISR) and how does it compare to SSR?",
        answer: "SSR (Server-Side Rendering) executes data fetching and renders HTML dynamically on EVERY incoming request, increasing server load and response latency. ISR (Incremental Static Regeneration) generates static HTML pages and updates them in the background after a specified revalidation interval (e.g., 'revalidate = 60'). Users get instant static page loads from CDN while content stays fresh.",
        keyConcepts: ["Stale-while-revalidate", "CDN edge delivery", "Dynamic vs Static rendering", "Build-time efficiency"]
      },
      {
        id: "next_q5",
        question: "How do Next.js Middleware and Edge Functions work?",
        answer: "Middleware runs BEFORE a request is completed, executing on V8 Edge runtimes located geographically close to the user. It allows header inspection, path rewriting, redirecting unauthenticated users, and reading cookies before the route renders. Because it runs on a lightweight Edge runtime, it does not support full Node.js APIs (e.g., fs module).",
        keyConcepts: ["Edge runtime", "NextResponse API", "Route guard redirection", "Cookie authentication"]
      }
    ]
  },

  skill_docker: {
    project: {
      title: "Multi-Stage Containerization & Production Docker Compose Cluster",
      description: "Containerize a microservice application with optimized multi-stage builds, non-root security profiles, and docker-compose orchestration.",
      deliverables: [
        "Write production multi-stage Dockerfile shrinking application image from 1GB to <60MB",
        "Configure non-root user execution and health checks within Dockerfile",
        "Author docker-compose.yml orchestrating API, PostgreSQL, and Redis cache with persistent volumes",
        "Setup automated container vulnerability scanning with Trivy in CI pipeline"
      ],
      proofOfMastery: "Production Dockerfile, docker-compose.yml setup, and Trivy zero-vulnerability audit report."
    },
    interviewQuestions: [
      {
        id: "doc_q1",
        question: "What is a multi-stage Docker build and why is it essential for production security and performance?",
        answer: "Multi-stage builds use multiple 'FROM' statements in a single Dockerfile. Early stages install compilers, SDKs, and build dependencies; the final stage copies only the built artifacts into a minimal production base image (like Alpine or Distroless). This keeps production image size minimal (reducing download latency) and removes compilers/package managers, drastically reducing the attack surface.",
        keyConcepts: ["Multi-stage builds", "Distroless / Alpine images", "Attack surface minimization", "Layer caching"]
      },
      {
        id: "doc_q2",
        question: "What is the difference between an Image Layer and a Container Layer, and how does Copy-on-Write work?",
        answer: "A Docker image is composed of read-only layers built step-by-step from Dockerfile instructions. When a container is run from an image, Docker adds a thin read-write 'container layer' on top using a storage driver (Overlay2). Under Copy-on-Write (CoW), if a process inside the container modifies an existing image file, the file is copied up to the writable layer before editing, preserving the base image intact.",
        keyConcepts: ["UnionFS / Overlay2", "Read-only image layers", "Copy-on-Write (CoW)", "Container layer"]
      },
      {
        id: "doc_q3",
        question: "What is the difference between CMD and ENTRYPOINT in a Dockerfile?",
        answer: "'ENTRYPOINT' defines the default executable that will always run when the container starts. 'CMD' defines the default parameters passed to the ENTRYPOINT, which can be easily overridden by command-line arguments when running 'docker run'. When used together in exec form ('[\"executable\", \"param\"]'), ENTRYPOINT specifies the binary and CMD provides default flags.",
        keyConcepts: ["Exec form vs Shell form", "Default arguments overriding", "Container initialization"]
      },
      {
        id: "doc_q4",
        question: "How do Docker networks work and how do containers communicate in Docker Compose?",
        answer: "Docker provides bridge, host, overlay, and macvlan networks. Docker Compose automatically creates a shared user-defined bridge network. On this network, Docker runs an embedded DNS server that resolves container service names (e.g., 'http://db:5432') directly to internal container IP addresses, enabling isolated inter-container communication without exposing ports to the host.",
        keyConcepts: ["Bridge network", "Embedded DNS service discovery", "Port publishing vs exposing", "Network isolation"]
      },
      {
        id: "doc_q5",
        question: "Why should containers never run as root, and how do you enforce non-root users?",
        answer: "Running as root inside a container means that if a security escape vulnerability occurs, the attacker gains root privileges over the host machine. To enforce non-root execution: 1. Create a dedicated user/group in the Dockerfile ('RUN addgroup -S app && adduser -S app -G app'). 2. Switch user before running the command ('USER app'). 3. Chown necessary application files.",
        keyConcepts: ["Container breakout risk", "USER directive", "Least privilege principle", "Read-only root filesystem"]
      }
    ]
  },

  skill_python: {
    project: {
      title: "Async Data Pipeline & Analytical Microservice with FastAPI",
      description: "Build an asynchronous analytical REST API in Python featuring Pydantic schemas, connection pooling, and automated pytest-asyncio suites.",
      deliverables: [
        "Implement async REST endpoints with Pydantic v2 data validation schemas",
        "Integrate async database ORM with connection pooling using SQLAlchemy 2.0 and asyncpg",
        "Implement background task queuing with Celery/Redis for CPU-intensive data transformations",
        "Write automated unit and integration tests using pytest-asyncio and httpx.AsyncClient"
      ],
      proofOfMastery: "Fully typed Python repository with passing pytest suite and automated GitHub Actions CI workflow."
    },
    interviewQuestions: [
      {
        id: "py_q1",
        question: "What is Python's Global Interpreter Lock (GIL) and how does it impact concurrency?",
        answer: "The GIL is a mutex in CPython that prevents multiple native threads from executing Python bytecodes simultaneously. Consequently, multithreading in Python does NOT speed up CPU-bound tasks (which are bottlenecked on a single core). However, for I/O-bound tasks (network calls, database queries), threads or 'asyncio' release the GIL while waiting, achieving high concurrency. For CPU-bound tasks, use the 'multiprocessing' module.",
        keyConcepts: ["CPython GIL mutex", "CPU-bound vs I/O-bound", "asyncio event loop", "multiprocessing module"]
      },
      {
        id: "py_q2",
        question: "What is the difference between generators and iterators in Python, and how does 'yield' work?",
        answer: "An iterator is an object implementing the iterator protocol ('__iter__()' and '__next__()'). A generator is a function that uses the 'yield' keyword to return an iterator. When 'yield' is executed, the function's state, local variables, and instruction pointer are frozen in memory and yielded to the caller. This enables processing huge datasets with O(1) memory consumption.",
        keyConcepts: ["Lazy evaluation", "Memory efficiency", "yield vs return", "Generator expressions"]
      },
      {
        id: "py_q3",
        question: "How does Python manage memory (Reference Counting and Garbage Collection)?",
        answer: "Python uses Reference Counting as its primary memory mechanism: every object stores a reference count; when the count drops to 0, memory is deallocated immediately. To handle reference cycles (e.g. object A points to B and B points to A), Python has a cyclical Garbage Collector that uses 3 generational pools (Gen 0, 1, 2) to detect and free circular references.",
        keyConcepts: ["Reference count", "Cyclical garbage collection", "Generational GC", "sys.getrefcount"]
      },
      {
        id: "py_q4",
        question: "What are Python Decorators and how do they work under the hood?",
        answer: "Decorators are functions that take another function as an argument, extend or modify its behavior without permanently altering the source code, and return a callable wrapper. They leverage Python's first-class functions and closures. The '@decorator' syntax is syntactic sugar for 'func = decorator(func)'. Always use 'functools.wraps' inside decorators to preserve docstrings and function names.",
        keyConcepts: ["First-class functions", "Closures", "functools.wraps", "Syntactic sugar"]
      },
      {
        id: "py_q5",
        question: "What makes FastAPI significantly faster than traditional frameworks like Flask and Django?",
        answer: "FastAPI is built on Starlette (high-performance ASGI toolkit) and Pydantic (data parsing compiled in Rust via pydantic-core). It leverages Python's native 'async'/'await' syntax running on uvloop (fast C-based event loop). Unlike synchronous WSGI frameworks (Flask/Django) that require a thread per request, FastAPI handles thousands of concurrent I/O connections on an event loop.",
        keyConcepts: ["ASGI vs WSGI", "Pydantic v2 Rust core", "uvloop", "Async I/O concurrency"]
      }
    ]
  },

  skill_spark: {
    project: {
      title: "Real-Time Lakehouse Streaming & Distributed ETL with Apache Spark",
      description: "Build an enterprise batch and streaming ETL pipeline processing parquet partitions with PySpark on a distributed cluster.",
      deliverables: [
        "Write PySpark structured streaming job reading JSON streams and computing rolling window aggregates",
        "Optimize Spark joins using Broadcast Hash Joins to eliminate shuffle bottlenecks",
        "Implement partitioned Parquet lakehouse storage with schema evolution",
        "Validate pipeline data quality metrics using Great Expectations assertions"
      ],
      proofOfMastery: "PySpark ETL script, execution plan audit with zero wide shuffles, and Great Expectations test suite."
    },
    interviewQuestions: [
      {
        id: "spark_q1",
        question: "What is the difference between RDD, DataFrame, and Dataset in Apache Spark?",
        answer: "RDD (Resilient Distributed Dataset) is the lowest-level abstraction: immutable, partitioned collections of objects with functional transformations, but lacking schema awareness and query optimization. DataFrames organize distributed data into named columns like SQL tables and use the Catalyst Optimizer to optimize execution plans. Datasets combine the benefits of RDDs (type safety at compile time) and DataFrames (Catalyst optimization), available in Scala/Java.",
        keyConcepts: ["Catalyst Optimizer", "Tungsten execution engine", "Compile-time type safety", "Lazy evaluation"]
      },
      {
        id: "spark_q2",
        question: "What is the difference between Narrow and Wide transformations in Spark, and why are Wide transformations expensive?",
        answer: "Narrow transformations (e.g. map, filter) can be computed from a single input partition without data exchange across nodes. Wide transformations (e.g. groupByKey, reduceByKey, join) require data from multiple partitions across the cluster, triggering a 'Shuffle'—where data is written to disk, transferred over the network, and sorted. Shuffles are the primary bottleneck in distributed jobs.",
        keyConcepts: ["Data shuffling", "Network I/O bottleneck", "Partitioning strategies", "reduceByKey vs groupByKey"]
      },
      {
        id: "spark_q3",
        question: "How does a Broadcast Hash Join work and when should you use it?",
        answer: "In a standard join between two large datasets, Spark shuffles both tables across cluster nodes based on join keys. If one table is small (e.g. <10MB lookup table), a Broadcast Hash Join copies the entire small table to every executor node's memory. This allows the join to be computed locally as a narrow transformation, completely eliminating the expensive network shuffle.",
        keyConcepts: ["Broadcast variable", "Shuffle elimination", "spark.sql.autoBroadcastJoinThreshold", "Join optimization"]
      },
      {
        id: "spark_q4",
        question: "How do you detect and resolve data skew in Apache Spark?",
        answer: "Data skew occurs when one or few partitions hold significantly more records than others (due to skewed keys like 'null' or popular IDs), causing a single executor task to run for hours while others finish in seconds. Fixes: 1. Salting: Add a random number suffix to keys before grouping, then aggregate in two stages. 2. Filter out null keys. 3. Enable Adaptive Query Execution (AQE) with 'spark.sql.adaptive.skewJoin.enabled = true'.",
        keyConcepts: ["Data skew", "Salting technique", "Adaptive Query Execution (AQE)", "Straggler tasks"]
      },
      {
        id: "spark_q5",
        question: "What is Structured Streaming in Spark and how do Watermarks handle late-arriving data?",
        answer: "Structured Streaming is a stream processing engine built on Spark SQL, treating a live data stream as an unbounded table that continuously appends rows. A 'Watermark' tells Spark how late data can arrive before it is dropped from state memory: 'withWatermark(\"timestamp\", \"10 minutes\")'. This prevents unbounded state store memory growth while allowing out-of-order events.",
        keyConcepts: ["Unbounded table", "Watermarking", "Event time vs Processing time", "State store memory"]
      }
    ]
  }
};

export function getPracticalGuideForSkill(skillId: string, courseTitle: string): ModulePracticalGuide {
  const normalizedId = skillId.toLowerCase();
  
  if (PRACTICAL_GUIDES[normalizedId]) {
    return PRACTICAL_GUIDES[normalizedId];
  }

  // Fallback matching by keyword in skillId or title
  const titleLower = courseTitle.toLowerCase();
  if (titleLower.includes("git") || normalizedId.includes("git")) return PRACTICAL_GUIDES["skill_git"];
  if (titleLower.includes("postgre") || titleLower.includes("sql") || normalizedId.includes("sql")) return PRACTICAL_GUIDES["skill_postgresql"];
  if (titleLower.includes("typescript") || normalizedId.includes("typescript")) return PRACTICAL_GUIDES["skill_typescript"];
  if (titleLower.includes("react") || normalizedId.includes("react")) return PRACTICAL_GUIDES["skill_react"];
  if (titleLower.includes("node") || titleLower.includes("express") || normalizedId.includes("node")) return PRACTICAL_GUIDES["skill_nodejs"];
  if (titleLower.includes("next") || normalizedId.includes("next")) return PRACTICAL_GUIDES["skill_nextjs"];
  if (titleLower.includes("docker") || titleLower.includes("container") || normalizedId.includes("docker")) return PRACTICAL_GUIDES["skill_docker"];
  if (titleLower.includes("python") || normalizedId.includes("python")) return PRACTICAL_GUIDES["skill_python"];
  if (titleLower.includes("spark") || normalizedId.includes("spark")) return PRACTICAL_GUIDES["skill_spark"];

  // Universal dynamic generator for any skill
  const skillClean = skillId.replace("skill_", "").replace(/_/g, " ").toUpperCase();
  return {
    project: {
      title: `Hands-On Portfolio Implementation: ${skillClean}`,
      description: `Build an end-to-end practical solution proving your mastery of ${skillClean} in a real-world engineering environment.`,
      deliverables: [
        `Architect and implement a modular solution demonstrating ${skillClean} best practices`,
        `Write automated unit tests verifying edge case handling and data validation`,
        `Optimize execution performance, memory footprint, and maintainability`,
        `Document the solution with an architectural diagram and reproducible setup guide`
      ],
      proofOfMastery: `Public code repository with documented architectural decisions and automated test suite demonstrating mastery of ${skillClean}.`
    },
    interviewQuestions: [
      {
        id: `${normalizedId}_q1`,
        question: `What are the core architectural principles and design patterns behind ${skillClean}?`,
        answer: `In production software engineering, ${skillClean} is designed around separation of concerns, deterministic execution, and predictable state transitions. Key architectural decisions balance latency against throughput and maintainability.`,
        keyConcepts: ["Separation of concerns", "Architectural patterns", "System reliability"]
      },
      {
        id: `${normalizedId}_q2`,
        question: `How do you diagnose and troubleshoot performance bottlenecks when working with ${skillClean}?`,
        answer: `Use profiling tools to measure resource consumption (CPU, RAM, I/O latency). Identify bottlenecks using systematic metrics rather than guesswork, and optimize data structures and caching layers accordingly.`,
        keyConcepts: ["Profiling", "Latency benchmarks", "Resource utilization", "Bottleneck mitigation"]
      },
      {
        id: `${normalizedId}_q3`,
        question: `What are the most common pitfalls and anti-patterns developers encounter in ${skillClean}?`,
        answer: `Common pitfalls include tight coupling, lack of error boundary containment, insufficient test coverage for boundary conditions, and failing to plan for horizontal scaling under high concurrent load.`,
        keyConcepts: ["Anti-patterns", "Error containment", "Scalability risks"]
      },
      {
        id: `${normalizedId}_q4`,
        question: `How do you ensure enterprise-grade security and vulnerability protection in ${skillClean}?`,
        answer: `Enforce the principle of least privilege, validate and sanitize all external inputs, avoid hardcoding secrets, use static analysis tools in CI/CD, and keep dependency trees audited against known CVE vulnerabilities.`,
        keyConcepts: ["Least privilege", "Input sanitization", "CVE audits", "Secure development"]
      },
      {
        id: `${normalizedId}_q5`,
        question: `How does ${skillClean} integrate into a continuous delivery (CI/CD) and automated deployment pipeline?`,
        answer: `Integrate automated linting, type-checking, automated unit/integration tests, containerized build artifact creation, and automated canary or blue-green deployments with rollback triggers.`,
        keyConcepts: ["CI/CD automation", "Test automation", "Canary deployment", "Zero-downtime release"]
      }
    ]
  };
}

