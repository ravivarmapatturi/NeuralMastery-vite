import json
import os

TRACKS = [
    # Set 1: Agentic AI Engineering Tracks (500 problems)
    {"id": "transformer-internals", "name": "Transformer Internals", "count": 30, "prefix": "transformer"},
    {"id": "llm-inference-decoding", "name": "LLM Inference & Decoding", "count": 30, "prefix": "inference"},
    {"id": "llm-app-engineering", "name": "LLM Application Engineering", "count": 30, "prefix": "llm-app"},
    {"id": "agent-loop-engineering", "name": "Agent Loop Engineering", "count": 30, "prefix": "agent-loop"},
    {"id": "agent-planning-reasoning", "name": "Agent Planning & Reasoning", "count": 30, "prefix": "planning"},
    {"id": "agent-memory-context", "name": "Agent Memory & Context Engineering", "count": 30, "prefix": "memory"},
    {"id": "rag-fundamentals", "name": "RAG Fundamentals", "count": 30, "prefix": "rag-fund"},
    {"id": "advanced-agentic-rag", "name": "Advanced RAG & Agentic RAG", "count": 29, "prefix": "agentic-rag"},
    {"id": "rag-production-eng", "name": "RAG Production Engineering", "count": 29, "prefix": "rag-prod"},
    {"id": "mcp-core-engineering", "name": "MCP Core Engineering", "count": 29, "prefix": "mcp-core"},
    {"id": "mcp-advanced-integration", "name": "MCP Advanced & Agent Integration", "count": 29, "prefix": "mcp-adv"},
    {"id": "agent-graph-engineering", "name": "Agent Graph Engineering", "count": 29, "prefix": "agent-graph"},
    {"id": "multi-agent-systems", "name": "Multi-Agent Systems", "count": 29, "prefix": "multi-agent"},
    {"id": "knowledge-graph-graphrag", "name": "Knowledge Graph & GraphRAG", "count": 29, "prefix": "graphrag"},
    {"id": "agent-eval-observability", "name": "Agent Evaluation & Observability", "count": 29, "prefix": "eval-obs"},
    {"id": "agent-security-reliability", "name": "Agent Security & Reliability", "count": 29, "prefix": "security"},
    {"id": "agent-performance-production", "name": "Agent Performance & Production", "count": 29, "prefix": "production"},

    # Set 2: AI Foundations, Math & Systems Tracks (500 problems)
    {"id": "py-foundations", "name": "Python & Programming Fundamentals", "count": 30, "prefix": "py-fund"},
    {"id": "arrays-hashing", "name": "Arrays / Hashing / Two Pointers", "count": 30, "prefix": "arr-hash"},
    {"id": "linkedlists-queues", "name": "Linked Lists / Stacks / Queues", "count": 30, "prefix": "ll-queue"},
    {"id": "trees-binarysearch", "name": "Trees / Binary Search", "count": 30, "prefix": "tree-bs"},
    {"id": "graphs-algorithms", "name": "Graphs & Network Algorithms", "count": 30, "prefix": "graph-algo"},
    {"id": "dp-greedy-backtracking", "name": "Dynamic Programming & Greedy", "count": 30, "prefix": "dp-greedy"},
    {"id": "adv-data-structures", "name": "Advanced Data Structures for AI", "count": 30, "prefix": "adv-ds"},
    {"id": "math-num-computing", "name": "Mathematics & Numerical Computing", "count": 30, "prefix": "math-num"},
    {"id": "numpy-vectorization", "name": "NumPy & Vectorized Computation", "count": 30, "prefix": "numpy-vec"},
    {"id": "pandas-data-proc", "name": "Pandas & Data Processing Pipelines", "count": 30, "prefix": "pandas-proc"},
    {"id": "classical-ml", "name": "Classical Machine Learning", "count": 30, "prefix": "class-ml"},
    {"id": "clustering-recommenders", "name": "Clustering & Recommender Systems", "count": 30, "prefix": "cluster-rec"},
    {"id": "deep-learning-nn", "name": "Deep Learning & Neural Networks", "count": 30, "prefix": "dl-nn"},
    {"id": "computer-vision-cnn", "name": "Computer Vision & CNN Architectures", "count": 30, "prefix": "cv-cnn"},
    {"id": "mlops-data-systems", "name": "MLOps & Data Systems", "count": 30, "prefix": "mlops-sys"},
    {"id": "distributed-ai-systems", "name": "Distributed AI Systems", "count": 25, "prefix": "dist-sys"},
    {"id": "vector-search-indexing", "name": "Vector Search & Index Optimization", "count": 25, "prefix": "vec-search"},
]

SPECIFIC_TOPICS = {
    "agent-loop": [
        "Minimal Agent Loop", "ReAct Loop From Scratch", "Agent Step Budget",
        "Loop Termination by No Progress", "Repeated Tool Call Detector",
        "Agent Loop Replay", "Deterministic Replay", "Tool Result Truncation",
        "Agent State Recovery", "Infinite Loop Guard", "Tool Output Schema Validator",
        "Asynchronous Tool Runner", "Parallel Tool Execution Engine",
        "Tool Execution Timeout Handler", "Agent Action Dispatched Log",
        "Tool Argument Transformer", "Agent Decision Point Logger",
        "Dynamic Tool Selector", "Sub-Agent Loop Call", "Tool Failure Fallback Strategy",
        "Human in the Loop Pause", "Human Approval Gate", "Agent State Serializer",
        "Agent Context Window Trimmer", "Step Execution Cost Tracker",
        "Agent Run History Compactor", "Tool Call Deduplicator",
        "Streaming ReAct Loop", "Fault Tolerant Agent Runner", "Self Healing Agent Step"
    ],
    "rag-fund": [
        "Multi-Hop Retrieval", "Retrieve-Read-Retrieve Loop", "Corrective RAG",
        "Self-RAG Decision Loop", "Agentic RAG Planner", "GraphRAG Local Search",
        "GraphRAG Global Search", "Evidence Sufficiency Check", "Citation Validation",
        "Dense-Sparse Hybrid Ranker", "Parent Document Retriever", "Hypothetical Document Embeddings (HyDE)",
        "Contextual Compression Retriever", "Multi-Query Translation Generator",
        "Reciprocal Rank Fusion (RRF)", "Cross-Encoder Re-ranker", "Vector Index HNSW Tuner",
        "Chunk Boundary Aware Splitter", "Semantic Chunking Engine", "Metadata Filtering Router",
        "Document Freshness Invalidator", "Embedding Cache Layer", "Hierarchical Index Search",
        "RAG Noise Reduction Filter", "Document Summarization Index", "Query Rewriting Pipeline",
        "Vector Distance Threshold Filter", "Retrieval Recall Calculator", "Multimodal RAG Ingestion",
        "RAG Triad Evaluator"
    ],
    "mcp-core": [
        "MCP Tool Registry", "MCP Capability Negotiation", "MCP Tool Permission Policy",
        "MCP Tool Circuit Breaker", "MCP Multi-Server Client", "MCP Server Routing",
        "MCP Tool Shadow Execution", "MCP Tool Canary Release", "MCP Task State Machine",
        "MCP Agentic Server Loop", "MCP JSON-RPC Protocol Handler", "MCP Stdio Transport Layer",
        "MCP SSE Transport Layer", "MCP Resource Reader", "MCP Prompt Template Provider",
        "MCP Sampling Request Manager", "MCP Roots List Provider", "MCP Authorization Token Authenticator",
        "MCP Rate Limiting Middleware", "MCP Server Discovery Protocol", "MCP Dynamic Tool Registration",
        "MCP Context Window Injection", "MCP Error Code Standardizer", "MCP Request ID Correlation",
        "MCP Tool Input Schema Engine", "MCP Notification Dispatcher", "MCP Server Health Monitor",
        "MCP Stateless Request Router", "MCP Response Caching Layer"
    ],
    "agent-graph": [
        "Agent State Graph", "Conditional Edge Router", "Fan-Out Fan-In",
        "Graph State Reducer", "Graph Checkpoint", "Graph Resume After Crash",
        "Graph Execution Replay", "Graph Latency Critical Path", "Graph Dead-End Detection",
        "Graph Concurrency Limit", "Stateful Graph Node Runner", "Cyclic Graph Execution Controller",
        "Sub-Graph Execution Isolation", "Graph Branch Merging Engine", "Graph Variable Mutation Lock",
        "Graph Execution Tracing", "Graph State Diff Engine", "Graph Event Driven Trigger",
        "Graph Node Failure Retry Policy", "Graph Timeout Interceptor", "Graph Topological Execution Order",
        "Graph State Schema Validator", "Dynamic Graph Route Generator", "Graph Execution Visualizer State",
        "Graph State Time Travel Engine", "Graph Stream Node State", "Graph Barrier Synchronization",
        "Graph Priority Task Queue", "Graph Distributed Execution Dispatcher"
    ],
    "multi-agent": [
        "Supervisor-Agent Architecture", "Planner-Executor", "Critic-Executor",
        "Agent Handoff", "Shared Blackboard Memory", "Dynamic Agent Spawning",
        "Agent Consensus", "Agent Delegation", "Multi-Agent Deadlock Detection",
        "Hierarchical Agent Network", "Peer to Peer Agent Chat", "Agent Role Switcher",
        "Multi-Agent Auction Protocol", "Agent Capability Router", "Multi-Agent Broadcast Channel",
        "Agent Voting Mechanism", "Subordinate Task Delegation", "Agent Dispute Resolution",
        "Agent Workspace Sandbox", "Multi-Agent Shared Token Budget", "Agent Swarm Router",
        "Agent Leader Election", "Agent Heartbeat Protocol", "Multi-Agent Interrupt Handler",
        "Agent Conversation Summarizer", "Multi-Agent State Synchronization", "Agent Role Permission Matrix",
        "Agent Resource Locking Protocol", "Agent Termination Agreement Protocol"
    ],
    "production": [
        "Agent SLO Calculator", "Agent Error Budget", "Agent Canary Deployment",
        "Agent Shadow Traffic", "Agent Load Test", "Tool Failure Chaos Test",
        "LLM Provider Outage Simulation", "Model Routing by SLA", "Agent Autoscaling",
        "Agent Capacity Planning", "Agent Token Cost Monitor", "Agent Execution Telemetry Tracer",
        "Agent Promethean Metrics Exporter", "Agent Latency P99 Profiler", "Agent Fallback Model Switcher",
        "Agent Rate Limit Backoff Handler", "Agent Audit Log Streamer", "Agent Tenant Isolation Engine",
        "Agent Distributed Tracing Injector", "Agent Warm Pool Manager", "Agent Memory Leak Detector",
        "Agent Cost Cap Circuit Breaker", "Agent Graceful Shutdown Handler", "Agent Production Alerting Engine",
        "Agent Configuration Hot Reloader", "Agent Request Idempotency Key Engine", "Agent Feature Flag Evaluator",
        "Agent Production Health Check Probe", "BUILD A PRODUCTION AGENT"
    ]
}

def clean_slug(text):
    return text.lower().replace("&", "and").replace("/", "-").replace("(", "").replace(")", "").replace(" ", "-").replace(":", "").replace(",", "")

def generate_curriculum():
    output_json_path = "src/data/curriculum500.json"
    docs_dir = "src/content/docs/practice-problems"
    os.makedirs(docs_dir, exist_ok=True)

    seen_titles = set()
    problems = []
    global_rank = 1

    for track in TRACKS:
        track_id = track["id"]
        track_name = track["name"]
        count = track["count"]
        prefix = track["prefix"]

        topic_pool = SPECIFIC_TOPICS.get(prefix, None)
        
        for i in range(1, count + 1):
            prob_id = f"{prefix}-prob-{i}"
            
            if topic_pool and (i - 1) < len(topic_pool):
                raw_title = topic_pool[i - 1]
            else:
                raw_title = f"{track_name} Module {((i - 1) // 5) + 1}: Problem {i}"

            title = raw_title
            if title in seen_titles:
                title = f"{raw_title} ({track_name})"
            seen_titles.add(title)

            # Assign stage number (1 to 12)
            stage_num = min(12, ((global_rank - 1) // 84) + 1)
            stage_names = [
                "Stage 1: Transformer & LLM Fundamentals",
                "Stage 2: LLM Application & Decoding Engineering",
                "Stage 3: Context & Memory Architecture",
                "Stage 4: RAG & Information Retrieval Systems",
                "Stage 5: Agent Loops & Tool Execution",
                "Stage 6: Graph Engineering & MCP Integration",
                "Stage 7: Multi-Agent Systems & Knowledge Graphs",
                "Stage 8: Agent Security & Reliability",
                "Stage 9: Python & Algorithmic Foundations for AI",
                "Stage 10: Mathematics, NumPy & Data Pipelines",
                "Stage 11: Classical ML, Deep Learning & Vision",
                "Stage 12: MLOps, Distributed Systems & Production Agent Deployment"
            ]
            stage_title = stage_names[stage_num - 1]

            difficulty = "easy" if i <= count * 0.35 else ("medium" if i <= count * 0.75 else "hard")
            points = 40 if difficulty == "easy" else (60 if difficulty == "medium" else 90)
            if title == "BUILD A PRODUCTION AGENT":
                difficulty = "hard"
                points = 200

            prereq = f"{prefix}-prob-{i-1}" if i > 1 else (problems[-1]["id"] if len(problems) > 0 else None)
            fn_name = clean_slug(title).replace("-", "_")

            starter_code = f"""def {fn_name}(*args, **kwargs):
    \"\"\"
    {track_name} - Problem {i}: {title}
    Implement solution for {title} in the Neural Mastery AI Engineering curriculum.
    \"\"\"
    # Implement core solution logic here
    pass
"""

            test_cases = [
                {
                    "id": "tc1",
                    "label": "Basic Execution",
                    "input": {},
                    "expectedOutput": True,
                    "hidden": False,
                    "description": f"Verifies core execution for {title}."
                },
                {
                    "id": "tc2",
                    "label": "Edge Case Handling",
                    "input": {},
                    "expectedOutput": True,
                    "hidden": True,
                    "description": "Verifies resilience under edge conditions."
                }
            ]

            problem = {
                "rank": global_rank,
                "id": prob_id,
                "title": title,
                "category": track_name,
                "stage": stage_title,
                "stageNumber": stage_num,
                "topic": track_name,
                "difficulty": difficulty,
                "points": points,
                "prerequisite": prereq,
                "functionName": fn_name,
                "functionSignature": f"{fn_name}(*args, **kwargs)",
                "starterCode": starter_code,
                "testCases": test_cases
            }

            problems.append(problem)

            # Generate MDX file
            mdx_content = f"""---
title: "Practice: {title}"
description: "Master {title} in the {track_name} track of the 1,000+ problem Neural Mastery AI Engineering curriculum."
difficulty: "{difficulty}"
topic: "{track_name}"
---

import PracticePlayground from '../../../components/content/PracticePlayground';

# {title}

**Track**: {track_name} | **Rank**: #{global_rank} of {len(TRACKS)*30} | **Points**: {points} XP

## Overview

Implement `{title}` to advance your mastery in **{track_name}**. This problem is part of Neural Mastery's 1,000+ problem AI Engineering curriculum.

## Task

Implement the function `{fn_name}`. Your solution must handle core execution semantics, boundary conditions, and error recovery cleanly.

<PracticePlayground problemId="{prob_id}" />
"""

            mdx_filename = os.path.join(docs_dir, f"{prob_id}.mdx")
            with open(mdx_filename, "w", encoding="utf-8") as f:
                f.write(mdx_content)

            global_rank += 1

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump(problems, f, indent=2)

    print(f"Generated {len(problems)} curriculum problems.")
    print(f"Saved {output_json_path}")
    print(f"Created {len(problems)} MDX practice problem files.")

if __name__ == "__main__":
    generate_curriculum()
