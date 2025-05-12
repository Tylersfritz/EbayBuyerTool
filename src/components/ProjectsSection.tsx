
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Github, Link } from 'lucide-react';

// Project data
const projects = [
  {
    id: 1,
    title: "E-commerce Platform",
    description: "A fully responsive e-commerce platform built with React and Node.js. Features include product filtering, user authentication, and payment processing.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80",
    category: "web",
    tags: ["React", "Node.js", "MongoDB"],
    demoLink: "#",
    repoLink: "#"
  },
  {
    id: 2,
    title: "Task Management App",
    description: "A Kanban-style task management application that helps teams organize their workflow efficiently.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    category: "web",
    tags: ["Vue.js", "Firebase", "Tailwind CSS"],
    demoLink: "#",
    repoLink: "#"
  },
  {
    id: 3,
    title: "Financial Dashboard",
    description: "Interactive dashboard for monitoring financial data with customizable widgets and real-time data visualization.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    category: "design",
    tags: ["Figma", "UI/UX", "Prototyping"],
    demoLink: "#",
    repoLink: "#"
  },
  {
    id: 4,
    title: "Fitness Tracking Mobile App",
    description: "A mobile application that tracks workouts, nutrition, and provides personalized fitness recommendations.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
    category: "mobile",
    tags: ["React Native", "Redux", "GraphQL"],
    demoLink: "#",
    repoLink: "#"
  },
  {
    id: 5,
    title: "AI Content Generator",
    description: "An AI-powered tool that helps content creators generate ideas, outlines, and drafts for articles and social media posts.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    category: "ml",
    tags: ["Python", "TensorFlow", "NLP"],
    demoLink: "#",
    repoLink: "#"
  },
  {
    id: 6,
    title: "Restaurant Booking System",
    description: "A comprehensive booking system for restaurants featuring table management, customer profiles, and analytics.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    category: "web",
    tags: ["Angular", "Express", "PostgreSQL"],
    demoLink: "#",
    repoLink: "#"
  }
];

// Badge component for project tags
const ProjectBadge = ({ text }: { text: string }) => (
  <Badge variant="secondary" className="mr-1 mb-1">
    {text}
  </Badge>
);

// Project card component
const ProjectCard = ({ project }: { project: typeof projects[0] }) => (
  <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
    <div className="h-48 overflow-hidden">
      <img 
        src={project.image} 
        alt={project.title} 
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
    <CardHeader>
      <CardTitle>{project.title}</CardTitle>
      <div className="flex flex-wrap mt-1">
        {project.tags.map(tag => (
          <ProjectBadge key={tag} text={tag} />
        ))}
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <CardDescription className="text-base">{project.description}</CardDescription>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button variant="outline" size="sm" asChild>
        <a href={project.repoLink} target="_blank" rel="noopener noreferrer">
          <Github className="mr-1 h-4 w-4" /> Code
        </a>
      </Button>
      <Button size="sm" asChild>
        <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-1 h-4 w-4" /> Live Demo
        </a>
      </Button>
    </CardFooter>
  </Card>
);

const ProjectsSection = () => {
  const categories = [
    { value: "all", label: "All Projects" },
    { value: "web", label: "Web Development" },
    { value: "mobile", label: "Mobile Apps" },
    { value: "design", label: "UI/UX Design" },
    { value: "ml", label: "Machine Learning" },
  ];

  return (
    <section id="projects" className="bg-muted/50 py-24">
      <div className="section-container">
        <h2 className="section-title">Featured Projects</h2>
        <p className="section-subtitle">
          Explore my recent work across different technologies and domains.
          Each project represents a unique challenge and solution.
        </p>
        
        <Tabs defaultValue="all" className="mt-12">
          <TabsList className="mb-8">
            {categories.map(category => (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.value} value={category.value} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects
                  .filter(project => 
                    category.value === 'all' ? true : project.category === category.value
                  )
                  .map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))
                }
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default ProjectsSection;
