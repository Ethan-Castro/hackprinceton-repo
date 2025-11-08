import { pythonTools } from "@/lib/python-tools";
import { sqlTools } from "@/lib/sql-tools";
import { canvasTools } from "@/lib/canvas-tools";
import { chartTools } from "@/lib/chart-tools";
import { exaTools } from "@/lib/exa-search-tools";

async function testPythonTools() {
  console.log("\n🐍 Testing Python Tools...");

  try {
    console.log("  Testing executePython...");
    const pythonResult = await pythonTools.executePython.execute({
      code: `
import numpy as np
import matplotlib.pyplot as plt

# Generate sample data
x = np.linspace(0, 10, 100)
y = np.sin(x)

# Create plot
plt.figure(figsize=(10, 6))
plt.plot(x, y)
plt.title("Sin Wave")
plt.xlabel("X")
plt.ylabel("Y")
plt.grid(True)
plt.show()

# Print result
print(f"Generated {len(x)} data points")
print(f"Max Y: {y.max():.4f}, Min Y: {y.min():.4f}")
`,
      description: "Generate a sine wave visualization",
    });

    if (pythonResult.success) {
      console.log("  ✅ executePython passed");
      console.log(`     - Output: ${pythonResult.result?.output?.substring(0, 100)}...`);
      console.log(`     - Plots generated: ${pythonResult.result?.plots?.length || 0}`);
    } else {
      console.log("  ❌ executePython failed:", pythonResult.error);
    }
  } catch (error) {
    console.log("  ❌ executePython error:", error);
  }

  try {
    console.log("  Testing analyzeDataset...");
    const analysisResult = await pythonTools.analyzeDataset.execute({
      data: [
        { name: "Alice", age: 28, salary: 50000 },
        { name: "Bob", age: 35, salary: 60000 },
        { name: "Charlie", age: 32, salary: 55000 },
        { name: "Diana", age: 29, salary: 52000 },
      ],
      analysisType: "descriptive",
      columns: ["age", "salary"],
    });

    if (analysisResult.success) {
      console.log("  ✅ analyzeDataset passed");
      console.log(`     - Output: ${analysisResult.result?.output?.substring(0, 100)}...`);
    } else {
      console.log("  ❌ analyzeDataset failed:", analysisResult.error);
    }
  } catch (error) {
    console.log("  ❌ analyzeDataset error:", error);
  }
}

async function testSQLTools() {
  console.log("\n🗄️  Testing SQL Tools...");

  try {
    console.log("  Testing executeSQL...");
    const sqlResult = await sqlTools.executeSQL.execute({
      query: "SELECT 1 as test_column, 'hello' as message LIMIT 1",
    });

    if (sqlResult.success) {
      console.log("  ✅ executeSQL passed");
      console.log(`     - Rows returned: ${sqlResult.result?.rowCount || 0}`);
    } else {
      console.log("  ❌ executeSQL failed:", sqlResult.error);
    }
  } catch (error) {
    console.log("  ❌ executeSQL error:", error);
  }

  try {
    console.log("  Testing describeTable (with validation)...");
    const describeResult = await sqlTools.describeTable.execute({
      tableName: "information_schema.tables",
    });

    if (describeResult.success) {
      console.log("  ✅ describeTable passed");
      console.log(`     - Columns found: ${describeResult.result?.columns?.length || 0}`);
    } else {
      console.log("  ℹ️  describeTable (expected to fail without proper schema):", describeResult.error?.substring(0, 80));
    }
  } catch (error) {
    console.log("  ℹ️  describeTable validation test (expected):", String(error).substring(0, 80));
  }
}

async function testCanvasTools() {
  console.log("\n📊 Testing Canvas Tools...");

  try {
    console.log("  Testing generateMermaidDiagram...");
    const diagramResult = await canvasTools.generateMermaidDiagram.execute({
      title: "Test Flowchart",
      diagramType: "flowchart",
      content: `A[Start]
    B[Process]
    C[End]
    A --> B --> C`,
      description: "A simple test flowchart",
    });

    if (diagramResult.success) {
      console.log("  ✅ generateMermaidDiagram passed");
      console.log(`     - Mermaid code length: ${diagramResult.mermaidCode?.length || 0} chars`);
    } else {
      console.log("  ❌ generateMermaidDiagram failed");
    }
  } catch (error) {
    console.log("  ❌ generateMermaidDiagram error:", error);
  }

  try {
    console.log("  Testing generateMermaidFlowchart...");
    const flowchartResult = await canvasTools.generateMermaidFlowchart.execute({
      title: "Process Flow",
      nodes: [
        { id: "A", label: "Start", shape: "rect" },
        { id: "B", label: "Decision", shape: "diamond" },
        { id: "C", label: "End", shape: "rect" },
      ],
      edges: [
        { from: "A", to: "B", label: "Begin" },
        { from: "B", to: "C", label: "Complete" },
      ],
    });

    if (flowchartResult.success) {
      console.log("  ✅ generateMermaidFlowchart passed");
      console.log(`     - Mermaid code: ${flowchartResult.mermaidCode?.substring(0, 80)}...`);
    } else {
      console.log("  ❌ generateMermaidFlowchart failed");
    }
  } catch (error) {
    console.log("  ❌ generateMermaidFlowchart error:", error);
  }

  try {
    console.log("  Testing generateMermaidERDiagram...");
    const erResult = await canvasTools.generateMermaidERDiagram.execute({
      title: "Database Schema",
      entities: [
        { name: "User", attributes: ["id INT", "name VARCHAR"] },
        { name: "Post", attributes: ["id INT", "user_id INT", "content TEXT"] },
      ],
      relationships: [
        { from: "User", to: "Post", cardinality: "||", label: "creates" },
      ],
    });

    if (erResult.success) {
      console.log("  ✅ generateMermaidERDiagram passed");
      console.log(`     - Mermaid code length: ${erResult.mermaidCode?.length || 0} chars`);
    } else {
      console.log("  ❌ generateMermaidERDiagram failed");
    }
  } catch (error) {
    console.log("  ❌ generateMermaidERDiagram error:", error);
  }
}

async function testChartTools() {
  console.log("\n📈 Testing Chart Tools...");

  try {
    console.log("  Testing generateChart...");
    const chartResult = await chartTools.generateChart.execute({
      title: "Sales Data",
      description: "Monthly sales figures",
      chartType: "bar",
      data: [
        { month: "Jan", sales: 1000, revenue: 5000 },
        { month: "Feb", sales: 1500, revenue: 7500 },
        { month: "Mar", sales: 2000, revenue: 10000 },
      ],
      config: {
        sales: { label: "Sales", color: "#3b82f6" },
        revenue: { label: "Revenue", color: "#10b981" },
      },
      xAxisKey: "month",
      yAxisKeys: ["sales", "revenue"],
    });

    if (chartResult.success) {
      console.log("  ✅ generateChart passed");
      console.log(`     - Data points: ${chartResult.data?.length || 0}`);
    } else {
      console.log("  ❌ generateChart failed");
    }
  } catch (error) {
    console.log("  ❌ generateChart error:", error);
  }
}

async function testWebSearchTools() {
  console.log("\n🔍 Testing Web Search Tools...");

  try {
    console.log("  Testing webSearch...");
    const searchResult = await exaTools.webSearch.execute({
      query: "artificial intelligence trends 2024",
      numResults: 3,
    });

    if (searchResult.success) {
      console.log("  ✅ webSearch passed");
      console.log(`     - Results found: ${searchResult.results?.length || 0}`);
    } else {
      console.log("  ℹ️  webSearch (may require API key):", searchResult.error?.substring(0, 80));
    }
  } catch (error) {
    console.log("  ℹ️  webSearch test (may require API key):", String(error).substring(0, 80));
  }
}

async function runAllTests() {
  console.log("🚀 Starting Business Analyst Tools Test Suite\n");
  console.log("================================================\n");

  await testPythonTools();
  await testSQLTools();
  await testCanvasTools();
  await testChartTools();
  await testWebSearchTools();

  console.log("\n================================================");
  console.log("✅ Test suite completed!\n");
}

runAllTests().catch(console.error);
