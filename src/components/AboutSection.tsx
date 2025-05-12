
import React from 'react';
import { Progress } from '@/components/ui/progress';

const skills = [
  { name: "HTML/CSS", level: 95 },
  { name: "JavaScript/TypeScript", level: 92 },
  { name: "React/Next.js", level: 90 },
  { name: "Node.js/Express", level: 85 },
  { name: "UI/UX Design", level: 80 },
  { name: "Database Design", level: 75 },
];

const experiences = [
  {
    position: "Lead Frontend Developer",
    company: "Tech Solutions Inc.",
    period: "2021 - Present",
    description: "Leading the frontend development team, architecting scalable solutions, and implementing best practices."
  },
  {
    position: "Full Stack Developer",
    company: "Digital Innovations",
    period: "2018 - 2021",
    description: "Developed and maintained full-stack web applications, collaborated with design teams, and optimized application performance."
  },
  {
    position: "Web Developer",
    company: "Creative Agency",
    period: "2016 - 2018",
    description: "Created responsive websites, implemented UI components, and collaborated with designers to deliver exceptional user experiences."
  }
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24">
      <div className="section-container">
        <h2 className="section-title">About Me</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4 font-display">My Story</h3>
            <div className="space-y-4 text-lg">
              <p>
                I'm a passionate full-stack developer with over 5 years of experience building web and mobile applications. 
                My journey in tech began when I built my first website at 15, and I've been hooked ever since.
              </p>
              <p>
                I specialize in creating elegant, efficient solutions that solve real-world problems. 
                With expertise in modern JavaScript frameworks and a keen eye for design, 
                I bridge the gap between functionality and aesthetics.
              </p>
              <p>
                When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects, 
                or sharing my knowledge through blog posts and community events.
              </p>
            </div>
            
            <h3 className="text-2xl font-bold mt-8 mb-4 font-display">Experience</h3>
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                  <h4 className="font-bold text-lg">{exp.position}</h4>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">{exp.company}</span>
                    <span className="text-sm text-muted-foreground">{exp.period}</span>
                  </div>
                  <p>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-6 font-display">Skills & Expertise</h3>
            <div className="space-y-4">
              {skills.map((skill) => (
                <div key={skill.name} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span>{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              ))}
            </div>
            
            <h3 className="text-2xl font-bold mt-12 mb-6 font-display">Education</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4 mb-6">
                <h4 className="font-bold text-lg">Master of Computer Science</h4>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">University of Technology</span>
                  <span className="text-sm text-muted-foreground">2014 - 2016</span>
                </div>
                <p className="mt-1">Specialized in Software Engineering with focus on web technologies and distributed systems.</p>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-bold text-lg">Bachelor of Science in Computer Science</h4>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">State University</span>
                  <span className="text-sm text-muted-foreground">2010 - 2014</span>
                </div>
                <p className="mt-1">Graduated with honors. Member of the Computer Science Society.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
