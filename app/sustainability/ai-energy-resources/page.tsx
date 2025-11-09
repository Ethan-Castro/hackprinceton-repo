"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Zap,
  Leaf,
  BookOpen,
  LineChart,
  Globe,
  Database,
  Brain,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Calculator,
  Building2,
  Lightbulb,
  FileText,
  Users,
  Award,
  Target
} from "lucide-react";

export default function AIEnergyResourcesPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Zap className="h-10 w-10 text-yellow-500" />
          AI Energy & Environmental Impact Resources
        </h1>
        <p className="text-muted-foreground text-lg">
          A comprehensive collection of research, tools, and organizations focused on understanding and reducing the environmental footprint of artificial intelligence.
        </p>
      </div>

      <Tabs defaultValue="research" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="practices">Best Practices</TabsTrigger>
          <TabsTrigger value="data">Datasets</TabsTrigger>
        </TabsList>

        {/* Research Papers & Articles */}
        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Foundational Research Papers
              </CardTitle>
              <CardDescription>
                Seminal papers on AI energy consumption and environmental impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ResearchPaper
                title="Energy and Policy Considerations for Deep Learning in NLP"
                authors="Emma Strubell, Ananya Ganesh, Andrew McCallum"
                year="2019"
                venue="ACL"
                tags={["NLP", "Energy", "Carbon"]}
                description="Groundbreaking study quantifying the carbon footprint of training large NLP models, showing BERT training emits as much CO2 as a trans-American flight."
                link="https://arxiv.org/abs/1906.02243"
                impact="high"
              />
              
              <Separator />
              
              <ResearchPaper
                title="Carbon Emissions and Large Neural Network Training"
                authors="David Patterson et al."
                year="2021"
                venue="arXiv"
                tags={["Carbon", "Training", "Efficiency"]}
                description="Comprehensive analysis showing training GPT-3 emitted approximately 552 tons of CO2, equivalent to 120 homes' annual energy consumption."
                link="https://arxiv.org/abs/2104.10350"
                impact="high"
              />

              <Separator />

              <ResearchPaper
                title="The Carbon Footprint of Machine Learning Training Will Plateau, Then Shrink"
                authors="David Patterson, Joseph Gonzalez, Urs Hölzle, Quoc Le, Chen Liang, et al."
                year="2022"
                venue="IEEE Computer"
                tags={["Carbon", "Future", "Optimization"]}
                description="Optimistic outlook showing ML carbon footprint could decrease 100-1000x through hardware efficiency, algorithmic improvements, and clean energy."
                link="https://ieeexplore.ieee.org/document/9875278"
                impact="medium"
              />

              <Separator />

              <ResearchPaper
                title="Estimating the Carbon Footprint of BLOOM, a 176B Parameter Language Model"
                authors="Luccioni et al."
                year="2022"
                venue="arXiv"
                tags={["LLM", "Carbon", "Measurement"]}
                description="Detailed carbon accounting for BLOOM's complete lifecycle: 25 tCO2eq for training, 19 tCO2eq for manufacturing, showing inference costs can exceed training."
                link="https://arxiv.org/abs/2211.02001"
                impact="high"
              />

              <Separator />

              <ResearchPaper
                title="Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint"
                authors="Pengfei Li, Jianyi Yang, Mohammad A. Islam, Shaolei Ren"
                year="2023"
                venue="arXiv"
                tags={["Water", "Sustainability", "Infrastructure"]}
                description="Reveals GPT-3 training consumed 700,000 liters of water for datacenter cooling. A 20-50 query conversation with ChatGPT requires 500ml of water."
                link="https://arxiv.org/abs/2304.03271"
                impact="high"
              />

              <Separator />

              <ResearchPaper
                title="Power Hungry Processing: Watts Driving the Cost of AI Deployment?"
                authors="Alexandra Sasha Luccioni, Yacine Jernite, Emma Strubell"
                year="2023"
                venue="arXiv"
                tags={["Inference", "Energy", "Deployment"]}
                description="First large-scale study of AI inference energy costs across 88 models, showing text generation uses 1000x more energy than classification tasks."
                link="https://arxiv.org/abs/2311.16863"
                impact="high"
              />

              <Separator />

              <ResearchPaper
                title="Growing the Artificial Intelligence Tree: The Carbon Footprint of Training Models"
                authors="Victor Schmidt et al."
                year="2021"
                venue="NeurIPS Climate Change Workshop"
                tags={["Carbon", "Training", "Tracking"]}
                description="Introduces ML CO2 Impact tracking methodology and demonstrates carbon intensity varies 30x based on geographic location and time of training."
                link="https://arxiv.org/abs/2104.10350"
                impact="medium"
              />

              <Separator />

              <ResearchPaper
                title="Quantifying the Carbon Emissions of Machine Learning"
                authors="Alexandre Lacoste et al."
                year="2019"
                venue="arXiv"
                tags={["Carbon", "Measurement", "Tools"]}
                description="Proposes standardized framework for measuring ML carbon emissions and introduces the concept of 'carbon efficiency' as a key metric."
                link="https://arxiv.org/abs/1910.09700"
                impact="medium"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Industry Reports & Whitepapers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResourceLink
                title="AI and Climate Change: How they're connected, and what we can do about it"
                organization="Climate Change AI"
                year="2023"
                description="Comprehensive report on AI's dual role as both contributor to climate change and potential solution tool."
                link="https://www.climatechange.ai/reports"
                tags={["Climate", "Policy", "Solutions"]}
              />

              <Separator />

              <ResourceLink
                title="The AI Index Report 2024"
                organization="Stanford HAI"
                year="2024"
                description="Annual comprehensive analysis including dedicated chapter on AI environmental impacts, energy trends, and sustainability metrics."
                link="https://aiindex.stanford.edu/report/"
                tags={["Trends", "Metrics", "Industry"]}
              />

              <Separator />

              <ResourceLink
                title="Data Center Energy Usage Report"
                organization="IEA (International Energy Agency)"
                year="2023"
                description="Global analysis showing data centers consume 1% of global electricity, with AI workloads growing as primary driver."
                link="https://www.iea.org/energy-system/buildings/data-centres-and-data-transmission-networks"
                tags={["Datacenters", "Global", "Energy"]}
              />

              <Separator />

              <ResourceLink
                title="Google Environmental Report"
                organization="Google"
                year="2024"
                description="Transparency report showing 48% increase in GHG emissions since 2019, largely due to AI infrastructure growth."
                link="https://sustainability.google/reports/"
                tags={["Corporate", "Transparency", "Emissions"]}
              />

              <Separator />

              <ResourceLink
                title="Microsoft Environmental Sustainability Report"
                organization="Microsoft"
                year="2024"
                description="Details Microsoft's commitment to carbon negative by 2030, including AI-specific sustainability initiatives and challenges."
                link="https://www.microsoft.com/en-us/sustainability/reports"
                tags={["Corporate", "Carbon", "Goals"]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Key Statistics & Facts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <StatCard
                  icon={<Zap className="h-6 w-6 text-yellow-500" />}
                  stat="1,287 MWh"
                  description="Energy to train GPT-3 (175B parameters)"
                  source="Patterson et al., 2021"
                />
                <StatCard
                  icon={<Leaf className="h-6 w-6 text-green-500" />}
                  stat="552 tons CO2"
                  description="Carbon emissions from GPT-3 training"
                  source="Patterson et al., 2021"
                />
                <StatCard
                  icon={<TrendingUp className="h-6 w-6 text-blue-500" />}
                  stat="300,000x"
                  description="Increase in compute for AI training since 2012"
                  source="OpenAI, 2022"
                />
                <StatCard
                  icon={<Database className="h-6 w-6 text-purple-500" />}
                  stat="1-2%"
                  description="Global electricity used by data centers"
                  source="IEA, 2023"
                />
                <StatCard
                  icon={<AlertCircle className="h-6 w-6 text-orange-500" />}
                  stat="700,000L"
                  description="Water used to cool GPT-3 training infrastructure"
                  source="Li et al., 2023"
                />
                <StatCard
                  icon={<Brain className="h-6 w-6 text-pink-500" />}
                  stat="1000x"
                  description="More energy for text generation vs classification"
                  source="Luccioni et al., 2023"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools & Calculators */}
        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Carbon Tracking & Measurement Tools
              </CardTitle>
              <CardDescription>
                Tools to measure and track the environmental impact of your AI models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToolCard
                name="CodeCarbon"
                description="Python package that automatically tracks and estimates CO2 emissions from your compute infrastructure during training."
                features={[
                  "Real-time carbon tracking",
                  "Multiple cloud provider support",
                  "Visualization dashboard",
                  "Easy integration with existing workflows"
                ]}
                link="https://codecarbon.io/"
                github="https://github.com/mlco2/codecarbon"
                tags={["Python", "Tracking", "Open Source"]}
              />

              <Separator />

              <ToolCard
                name="ML CO2 Impact"
                description="Online calculator to estimate the carbon footprint of training machine learning models based on hardware, runtime, and location."
                features={[
                  "Web-based calculator",
                  "Geographic carbon intensity data",
                  "Hardware-specific estimates",
                  "Export reports"
                ]}
                link="https://mlco2.github.io/impact/"
                github="https://github.com/mlco2/impact"
                tags={["Calculator", "Web", "Research"]}
              />

              <Separator />

              <ToolCard
                name="Green Algorithms"
                description="Calculator for estimating carbon footprint of computational research across different platforms and locations."
                features={[
                  "Multi-platform support",
                  "HPC cluster integration",
                  "Academic focus",
                  "Detailed methodology"
                ]}
                link="http://www.green-algorithms.org/"
                tags={["HPC", "Research", "Academic"]}
              />

              <Separator />

              <ToolCard
                name="Carbontracker"
                description="Python tool to track and predict energy consumption and carbon footprint of training deep learning models."
                features={[
                  "Live tracking during training",
                  "Energy prediction",
                  "Multiple GPU support",
                  "Logging and visualization"
                ]}
                link="https://github.com/lfwa/carbontracker"
                github="https://github.com/lfwa/carbontracker"
                tags={["Python", "Deep Learning", "GPU"]}
              />

              <Separator />

              <ToolCard
                name="Experiment Impact Tracker"
                description="Python package from MIT that tracks energy usage and carbon emissions during ML experiments."
                features={[
                  "Automatic experiment logging",
                  "Regional carbon intensity",
                  "Comparative analysis",
                  "Export capabilities"
                ]}
                link="https://github.com/Breakend/experiment-impact-tracker"
                github="https://github.com/Breakend/experiment-impact-tracker"
                tags={["MIT", "Python", "Experiments"]}
              />

              <Separator />

              <ToolCard
                name="MLCO2 Calculator by Hugging Face"
                description="Integrated carbon emissions tracking in Hugging Face model cards and training runs."
                features={[
                  "Automatic model card integration",
                  "Training emissions tracking",
                  "Community visibility",
                  "Easy sharing"
                ]}
                link="https://huggingface.co/spaces/huggingface/MLCO2-calculator"
                tags={["Hugging Face", "Community", "Integration"]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Monitoring & Benchmarking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToolCard
                name="Weights & Biases Energy Tracking"
                description="Integrated energy and carbon tracking in W&B experiment tracking platform."
                features={[
                  "Real-time dashboards",
                  "Historical comparisons",
                  "Team collaboration",
                  "Integration with major frameworks"
                ]}
                link="https://wandb.ai/site/energy-tracking"
                tags={["MLOps", "Enterprise", "Dashboards"]}
              />

              <Separator />

              <ToolCard
                name="ElectricityMap"
                description="Real-time visualization of electricity carbon intensity by region, crucial for scheduling carbon-efficient training."
                features={[
                  "Real-time global data",
                  "Historical trends",
                  "API access",
                  "Mobile apps"
                ]}
                link="https://app.electricitymaps.com/"
                tags={["Data", "Realtime", "Global"]}
              />

              <Separator />

              <ToolCard
                name="Cloud Carbon Footprint"
                description="Open source tool that measures and visualizes cloud provider carbon emissions across AWS, GCP, and Azure."
                features={[
                  "Multi-cloud support",
                  "Cost optimization insights",
                  "Recommendations",
                  "Self-hosted or SaaS"
                ]}
                link="https://www.cloudcarbonfootprint.org/"
                github="https://github.com/cloud-carbon-footprint/cloud-carbon-footprint"
                tags={["Cloud", "Multi-provider", "Open Source"]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations */}
        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Research Organizations & Initiatives
              </CardTitle>
              <CardDescription>
                Leading organizations working on AI sustainability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrganizationCard
                name="Climate Change AI"
                description="Global nonprofit initiative using machine learning to address climate change, with a focus on AI's environmental impact."
                focus={["Research", "Community", "Policy"]}
                link="https://www.climatechange.ai/"
                achievements={[
                  "Published comprehensive reports on AI & climate",
                  "Annual NeurIPS workshop",
                  "Policy recommendations for governments"
                ]}
              />

              <Separator />

              <OrganizationCard
                name="Green AI"
                description="Research initiative focused on making AI more energy-efficient and environmentally friendly."
                focus={["Energy Efficiency", "Green Computing", "Research"]}
                link="https://www.greenai.org/"
                achievements={[
                  "Established green AI metrics",
                  "Published efficiency benchmarks",
                  "Created best practices guidelines"
                ]}
              />

              <Separator />

              <OrganizationCard
                name="AI4Climate"
                description="Initiative connecting AI researchers with climate scientists to develop sustainable AI solutions."
                focus={["Interdisciplinary", "Solutions", "Collaboration"]}
                link="https://ai4climate.org/"
                achievements={[
                  "100+ collaborative projects",
                  "Cross-sector partnerships",
                  "Open datasets for climate AI"
                ]}
              />

              <Separator />

              <OrganizationCard
                name="Partnership on AI - Environment Working Group"
                description="Multi-stakeholder organization addressing AI's environmental impacts through research and policy."
                focus={["Industry Collaboration", "Policy", "Standards"]}
                link="https://partnershiponai.org/"
                achievements={[
                  "Industry sustainability standards",
                  "Corporate accountability framework",
                  "Transparency guidelines"
                ]}
              />

              <Separator />

              <OrganizationCard
                name="Allen Institute for AI - Sustainability Initiative"
                description="Research lab dedicated to understanding and reducing the environmental footprint of AI research."
                focus={["Research", "Open Science", "Efficiency"]}
                link="https://allenai.org/sustainability"
                achievements={[
                  "Carbon impact papers",
                  "Efficient model architectures",
                  "Open carbon tracking tools"
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Industry Initiatives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrganizationCard
                name="Green Software Foundation"
                description="Linux Foundation project building standards and tools for sustainable software engineering, including AI applications."
                focus={["Standards", "Best Practices", "Tools"]}
                link="https://greensoftware.foundation/"
                achievements={[
                  "Software Carbon Intensity specification",
                  "Green software patterns catalog",
                  "Industry certifications"
                ]}
              />

              <Separator />

              <OrganizationCard
                name="MLCommons - Carbon Working Group"
                description="Working group within MLCommons developing benchmarks and standards for measuring AI environmental impact."
                focus={["Benchmarks", "Standards", "Measurement"]}
                link="https://mlcommons.org/en/groups/research-carbon/"
                achievements={[
                  "Carbon benchmark suite",
                  "Standardized metrics",
                  "Industry adoption guidelines"
                ]}
              />

              <Separator />

              <OrganizationCard
                name="Responsible AI Institute"
                description="Organization providing frameworks and certifications for responsible AI, including environmental considerations."
                focus={["Certification", "Governance", "Ethics"]}
                link="https://www.responsible.ai/"
                achievements={[
                  "Responsible AI certification program",
                  "Environmental impact assessments",
                  "Corporate guidance frameworks"
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics & Standards */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Key Metrics & Measurements
              </CardTitle>
              <CardDescription>
                Understanding how to measure AI environmental impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <MetricCard
                name="Carbon Intensity (gCO2eq/kWh)"
                description="Amount of CO2 emissions per kilowatt-hour of electricity consumed. Varies by region and energy source."
                formula="Total CO2 emissions ÷ Energy consumed"
                example="US grid average: ~400 gCO2eq/kWh; Iceland (hydro): ~20 gCO2eq/kWh"
                importance="Critical for understanding geographic impact of training location"
              />

              <Separator />

              <MetricCard
                name="Energy Consumption (kWh or MWh)"
                description="Total electrical energy used during model training or inference."
                formula="Power (kW) × Time (hours)"
                example="GPT-3 training: ~1,287 MWh; BERT base: ~1.5 MWh"
                importance="Foundation metric for all carbon calculations"
              />

              <Separator />

              <MetricCard
                name="Carbon Footprint (tCO2eq)"
                description="Total greenhouse gas emissions expressed as tons of CO2 equivalent."
                formula="Energy (kWh) × Carbon Intensity (gCO2eq/kWh) ÷ 1,000,000"
                example="GPT-3: ~552 tons CO2eq; average car annually: ~4.6 tons CO2eq"
                importance="Primary metric for environmental impact reporting"
              />

              <Separator />

              <MetricCard
                name="PUE (Power Usage Effectiveness)"
                description="Ratio of total facility energy to IT equipment energy. Measures datacenter efficiency."
                formula="Total Facility Energy ÷ IT Equipment Energy"
                example="Google datacenters: 1.10; Industry average: 1.67; Perfect: 1.0"
                importance="Indicates how efficiently datacenters use energy"
              />

              <Separator />

              <MetricCard
                name="FLOPS per Watt"
                description="Computational efficiency metric measuring operations per unit of energy."
                formula="Floating Point Operations ÷ Watts consumed"
                example="A100 GPU: ~312 TFLOPS/W; H100: ~500 TFLOPS/W"
                importance="Measures hardware efficiency for AI workloads"
              />

              <Separator />

              <MetricCard
                name="Model Carbon Cost"
                description="Total carbon emissions across model's complete lifecycle: training, deployment, and inference."
                formula="Training emissions + Infrastructure emissions + Inference emissions"
                example="BLOOM: 25 tCO2eq training + 19 tCO2eq infrastructure + ongoing inference"
                importance="Holistic view of model's environmental impact"
              />

              <Separator />

              <MetricCard
                name="Water Usage Effectiveness (WUE)"
                description="Measures water consumed for datacenter cooling per energy unit."
                formula="Annual Water Usage (liters) ÷ IT Equipment Energy (kWh)"
                example="Average datacenter: 1.8 L/kWh; Best practice: <0.5 L/kWh"
                importance="Critical for understanding water impact in water-scarce regions"
              />

              <Separator />

              <MetricCard
                name="Green Ratio"
                description="Percentage of energy consumption from renewable sources."
                formula="Renewable Energy (kWh) ÷ Total Energy (kWh) × 100"
                example="Google AI: 67% renewable; Industry average: ~25%"
                importance="Measures commitment to clean energy for AI operations"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Emerging Standards & Frameworks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StandardCard
                name="Software Carbon Intensity (SCI)"
                organization="Green Software Foundation"
                description="Standard for calculating software carbon intensity, including AI/ML applications."
                status="Published 2022"
                adoption="Growing industry adoption"
                link="https://sci.greensoftware.foundation/"
              />

              <Separator />

              <StandardCard
                name="ISO 14064 for AI Systems"
                organization="International Organization for Standardization"
                description="Adaptation of GHG accounting standard specifically for AI/ML systems."
                status="In development"
                adoption="Expected 2025"
                link="https://www.iso.org/standard/66453.html"
              />

              <Separator />

              <StandardCard
                name="MLPerf Power"
                organization="MLCommons"
                description="Benchmark suite measuring both performance and power consumption of ML training and inference."
                status="Active benchmarking"
                adoption="Industry-wide participation"
                link="https://mlcommons.org/en/inference-power/"
              />

              <Separator />

              <StandardCard
                name="Model Card Carbon Reporting"
                organization="Hugging Face / Research Community"
                description="Standardized format for reporting model environmental impact in model cards."
                status="Community standard"
                adoption="Widely adopted in research"
                link="https://huggingface.co/docs/hub/model-cards-environmental-impact"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Best Practices */}
        <TabsContent value="practices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Sustainable AI Development Practices
              </CardTitle>
              <CardDescription>
                Actionable strategies to reduce AI environmental impact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <PracticeCard
                category="Model Training"
                icon={<Brain className="h-5 w-5 text-purple-500" />}
                practices={[
                  {
                    title: "Train in low-carbon regions",
                    description: "Schedule training during off-peak hours in regions with high renewable energy percentage.",
                    impact: "Can reduce carbon emissions by 30-75%"
                  },
                  {
                    title: "Use efficient architectures",
                    description: "Employ model compression, distillation, and pruning to reduce model size and training requirements.",
                    impact: "10-100x reduction in compute requirements"
                  },
                  {
                    title: "Leverage transfer learning",
                    description: "Fine-tune existing models instead of training from scratch when possible.",
                    impact: "100-1000x less energy than training from scratch"
                  },
                  {
                    title: "Optimize hyperparameters intelligently",
                    description: "Use Bayesian optimization or early stopping instead of exhaustive grid search.",
                    impact: "50-90% reduction in training runs"
                  }
                ]}
              />

              <Separator />

              <PracticeCard
                category="Infrastructure"
                icon={<Database className="h-5 w-5 text-blue-500" />}
                practices={[
                  {
                    title: "Choose green cloud providers",
                    description: "Select providers with high renewable energy percentages and carbon-neutral commitments.",
                    impact: "50-80% lower carbon footprint"
                  },
                  {
                    title: "Use efficient hardware",
                    description: "Leverage specialized AI accelerators (TPUs, newer GPUs) with better FLOPS/Watt ratios.",
                    impact: "2-5x better energy efficiency"
                  },
                  {
                    title: "Implement auto-scaling",
                    description: "Automatically scale down resources during idle periods to minimize waste.",
                    impact: "20-40% reduction in energy waste"
                  },
                  {
                    title: "Optimize cooling systems",
                    description: "Use liquid cooling, free air cooling, or locate datacenters in cold climates.",
                    impact: "20-30% reduction in total facility energy"
                  }
                ]}
              />

              <Separator />

              <PracticeCard
                category="Model Inference"
                icon={<Zap className="h-5 w-5 text-yellow-500" />}
                practices={[
                  {
                    title: "Deploy efficient models",
                    description: "Use quantization, pruning, and distillation for production deployments.",
                    impact: "4-10x faster inference with minimal accuracy loss"
                  },
                  {
                    title: "Implement caching",
                    description: "Cache common queries and responses to avoid redundant inference.",
                    impact: "30-70% reduction in inference calls"
                  },
                  {
                    title: "Batch inference requests",
                    description: "Group multiple inference requests together to maximize GPU utilization.",
                    impact: "2-5x better throughput per watt"
                  },
                  {
                    title: "Use edge deployment",
                    description: "Deploy smaller models on edge devices where appropriate to reduce datacenter load.",
                    impact: "Eliminates transmission overhead and datacenter costs"
                  }
                ]}
              />

              <Separator />

              <PracticeCard
                category="Development Process"
                icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                practices={[
                  {
                    title: "Track carbon emissions",
                    description: "Use tools like CodeCarbon to monitor and report emissions throughout development.",
                    impact: "Visibility enables 20-40% optimization"
                  },
                  {
                    title: "Set sustainability targets",
                    description: "Include carbon budget alongside accuracy/performance metrics.",
                    impact: "Drives team focus on efficiency"
                  },
                  {
                    title: "Share trained models",
                    description: "Publish models and weights to reduce duplicate training by others.",
                    impact: "Prevents thousands of tons of redundant CO2"
                  },
                  {
                    title: "Document environmental impact",
                    description: "Include carbon footprint in model cards and technical documentation.",
                    impact: "Increases transparency and accountability"
                  }
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Carbon-Aware AI: Practical Implementation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge>Strategy 1</Badge> Geographic Optimization
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Carbon intensity varies dramatically by location. Training the same model in Quebec (hydro-powered) vs. Virginia (coal-heavy) can result in 10x difference in emissions.
                  </p>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Best regions: Iceland, Quebec, Norway</span>
                      <Badge variant="outline" className="text-green-600">~20 gCO2/kWh</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Good regions: California, UK, France</span>
                      <Badge variant="outline" className="text-blue-600">~100 gCO2/kWh</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Avoid: Coal-heavy regions</span>
                      <Badge variant="outline" className="text-red-600">~800+ gCO2/kWh</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge>Strategy 2</Badge> Temporal Optimization
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Grid carbon intensity changes throughout the day. Schedule training during periods of high renewable energy generation.
                  </p>
                  <div className="text-sm space-y-1">
                    <div>• Use ElectricityMap API for real-time carbon intensity</div>
                    <div>• Schedule long training runs for low-carbon windows</div>
                    <div>• Implement carbon-aware autoscaling</div>
                    <div>• Pause non-critical workloads during high-carbon periods</div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge>Strategy 3</Badge> Algorithm Efficiency
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Modern efficient architectures can achieve comparable performance with orders of magnitude less compute.
                  </p>
                  <div className="text-sm space-y-1">
                    <div>• LoRA/QLoRA: 50-90% reduction in trainable parameters</div>
                    <div>• Distillation: 95% of accuracy at 10% of size</div>
                    <div>• Mixture of Experts: Activate only needed parameters</div>
                    <div>• Efficient Attention: Flash Attention, Multi-Query Attention</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Datasets */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Public Datasets & Resources
              </CardTitle>
              <CardDescription>
                Open datasets for AI sustainability research
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DatasetCard
                name="ML CO2 Impact Dataset"
                description="Comprehensive dataset of carbon emissions from thousands of ML training runs across different hardware, locations, and model types."
                size="10,000+ training runs"
                format="CSV, JSON"
                link="https://mlco2.github.io/impact/#dataset"
                tags={["Carbon", "Training", "Benchmark"]}
                useCase="Benchmarking, research, carbon estimation model development"
              />

              <Separator />

              <DatasetCard
                name="ElectricityMap Historical Data"
                description="Historical carbon intensity data for electricity grids worldwide, updated hourly."
                size="200+ regions, 3+ years"
                format="API, CSV"
                link="https://www.electricitymaps.com/data-portal"
                tags={["Carbon Intensity", "Geographic", "Time Series"]}
                useCase="Carbon-aware scheduling, training optimization"
              />

              <Separator />

              <DatasetCard
                name="Cloud Carbon Footprint Dataset"
                description="Carbon emissions data for AWS, GCP, and Azure services including compute, storage, and networking."
                size="All major cloud services"
                format="API, Dashboard"
                link="https://www.cloudcarbonfootprint.org/"
                tags={["Cloud", "Multi-provider", "Services"]}
                useCase="Cloud cost optimization, carbon accounting"
              />

              <Separator />

              <DatasetCard
                name="CodeCarbon Emissions Database"
                description="Crowdsourced database of carbon emissions from real ML training runs using CodeCarbon tracking."
                size="Growing community dataset"
                format="PostgreSQL, API"
                link="https://codecarbon.io/explore"
                tags={["Community", "Real-world", "Diverse"]}
                useCase="Comparative analysis, benchmarking, research"
              />

              <Separator />

              <DatasetCard
                name="MLPerf Power Results"
                description="Official results from MLPerf power benchmarks showing performance and energy consumption across hardware."
                size="100+ submissions"
                format="CSV, JSON"
                link="https://mlcommons.org/en/inference-power-edge-10/"
                tags={["Benchmark", "Hardware", "Standardized"]}
                useCase="Hardware selection, efficiency comparison"
              />

              <Separator />

              <DatasetCard
                name="Data Center Energy Dataset"
                description="IEA dataset on global data center energy consumption, efficiency trends, and forecasts."
                size="Global coverage, 2010-present"
                format="Excel, PDF reports"
                link="https://www.iea.org/data-and-statistics"
                tags={["Datacenter", "Global", "Trends"]}
                useCase="Industry analysis, policy research, forecasting"
              />

              <Separator />

              <DatasetCard
                name="Model Carbon Footprint Repository"
                description="Curated repository of published carbon footprints for major AI models including training and inference costs."
                size="50+ major models"
                format="JSON, Model Cards"
                link="https://huggingface.co/datasets/MLCO2/model-carbon-footprints"
                tags={["Models", "Reference", "Published"]}
                useCase="Model selection, impact comparison, research"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reference Materials & Guides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ResourceLink
                title="Green AI: A Practical Guide"
                organization="Allen Institute for AI"
                year="2023"
                description="Comprehensive practitioner's guide to implementing sustainable AI practices in research and production."
                link="https://allenai.org/green-ai"
                tags={["Guide", "Practical", "Implementation"]}
              />

              <Separator />

              <ResourceLink
                title="Carbon Accounting for AI: A Framework"
                organization="Climate Change AI"
                year="2023"
                description="Detailed framework for measuring, reporting, and reducing carbon emissions across the AI lifecycle."
                link="https://www.climatechange.ai/reports"
                tags={["Framework", "Accounting", "Methodology"]}
              />

              <Separator />

              <ResourceLink
                title="Sustainable AI: Best Practices Checklist"
                organization="Green Software Foundation"
                year="2024"
                description="Actionable checklist for developers and organizations to implement sustainable AI practices."
                link="https://greensoftware.foundation/"
                tags={["Checklist", "Practical", "Best Practices"]}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Additional Resources & Community
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Newsletters & Updates</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Climate Change AI Newsletter (monthly)</li>
                <li>• Green Software Foundation Blog</li>
                <li>• AI & Sustainability Twitter/X: @ClimateChangeAI</li>
                <li>• MLCommons Research Newsletter</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Conferences & Events</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• NeurIPS Climate Change AI Workshop (annual)</li>
                <li>• ICML Sustainable AI Track</li>
                <li>• ACM SIGENERGY Conference</li>
                <li>• Green Software Foundation Summit</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component definitions below

interface ResearchPaperProps {
  title: string;
  authors: string;
  year: string;
  venue: string;
  tags: string[];
  description: string;
  link: string;
  impact: "high" | "medium" | "low";
}

function ResearchPaper({ title, authors, year, venue, tags, description, link, impact }: ResearchPaperProps) {
  const impactColors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{authors} · {venue} {year}</p>
        </div>
        <Badge className={impactColors[impact]}>{impact} impact</Badge>
      </div>
      <p className="text-sm">{description}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
        <Button variant="link" size="sm" asChild className="ml-auto">
          <a href={link} target="_blank" rel="noopener noreferrer">
            Read Paper <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}

interface ResourceLinkProps {
  title: string;
  organization: string;
  year: string;
  description: string;
  link: string;
  tags: string[];
}

function ResourceLink({ title, organization, year, description, link, tags }: ResourceLinkProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{organization} · {year}</p>
        </div>
      </div>
      <p className="text-sm">{description}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map(tag => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
        <Button variant="link" size="sm" asChild className="ml-auto">
          <a href={link} target="_blank" rel="noopener noreferrer">
            View Report <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  stat: string;
  description: string;
  source: string;
}

function StatCard({ icon, stat, description, source }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <div className="text-2xl font-bold">{stat}</div>
        </div>
        <p className="text-sm font-medium">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">Source: {source}</p>
      </CardContent>
    </Card>
  );
}

interface ToolCardProps {
  name: string;
  description: string;
  features: string[];
  link: string;
  github?: string;
  tags: string[];
}

function ToolCard({ name, description, features, link, github, tags }: ToolCardProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <ul className="text-sm space-y-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
        <div className="ml-auto flex gap-2">
          {github && (
            <Button variant="outline" size="sm" asChild>
              <a href={github} target="_blank" rel="noopener noreferrer">
                GitHub <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
          <Button variant="default" size="sm" asChild>
            <a href={link} target="_blank" rel="noopener noreferrer">
              Visit <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface OrganizationCardProps {
  name: string;
  description: string;
  focus: string[];
  link: string;
  achievements: string[];
}

function OrganizationCard({ name, description, focus, link, achievements }: OrganizationCardProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {focus.map(area => (
          <Badge key={area} variant="outline">{area}</Badge>
        ))}
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Key Achievements:</p>
        <ul className="text-sm space-y-1 text-muted-foreground">
          {achievements.map((achievement, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span>•</span>
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button variant="link" size="sm" asChild className="pl-0">
        <a href={link} target="_blank" rel="noopener noreferrer">
          Visit Website <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </Button>
    </div>
  );
}

interface MetricCardProps {
  name: string;
  description: string;
  formula: string;
  example: string;
  importance: string;
}

function MetricCard({ name, description, formula, example, importance }: MetricCardProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm">{description}</p>
      <div className="bg-muted p-3 rounded-md text-sm font-mono">
        {formula}
      </div>
      <div className="text-sm space-y-1">
        <p><span className="font-medium">Example:</span> {example}</p>
        <p><span className="font-medium">Importance:</span> {importance}</p>
      </div>
    </div>
  );
}

interface StandardCardProps {
  name: string;
  organization: string;
  description: string;
  status: string;
  adoption: string;
  link: string;
}

function StandardCard({ name, organization, description, status, adoption, link }: StandardCardProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{organization}</p>
        </div>
        <Badge variant="outline">{status}</Badge>
      </div>
      <p className="text-sm">{description}</p>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Adoption: {adoption}</p>
        <Button variant="link" size="sm" asChild>
          <a href={link} target="_blank" rel="noopener noreferrer">
            Learn More <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}

interface PracticeCardProps {
  category: string;
  icon: React.ReactNode;
  practices: Array<{
    title: string;
    description: string;
    impact: string;
  }>;
}

function PracticeCard({ category, icon, practices }: PracticeCardProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        {icon}
        {category}
      </h3>
      <div className="space-y-3">
        {practices.map((practice, idx) => (
          <div key={idx} className="border-l-2 border-primary pl-4 py-2">
            <h4 className="font-medium text-sm">{practice.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{practice.description}</p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
              Impact: {practice.impact}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DatasetCardProps {
  name: string;
  description: string;
  size: string;
  format: string;
  link: string;
  tags: string[];
  useCase: string;
}

function DatasetCard({ name, description, size, format, link, tags, useCase }: DatasetCardProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm">{description}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium">Size:</span> {size}
        </div>
        <div>
          <span className="font-medium">Format:</span> {format}
        </div>
      </div>
      <p className="text-sm"><span className="font-medium">Use Case:</span> {useCase}</p>
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map(tag => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
        <Button variant="link" size="sm" asChild className="ml-auto">
          <a href={link} target="_blank" rel="noopener noreferrer">
            Access Dataset <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}

