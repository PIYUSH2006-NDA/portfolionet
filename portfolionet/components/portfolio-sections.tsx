'use client'

import {
  ArrowDown,
  ArrowUpRight,
  BrainCircuit,
  Braces,
  BriefcaseBusiness,
  Database,
  Download,
  FileBadge2,
  Fingerprint,
  Globe2,
  GraduationCap,
  Github,
  Layers3,
  Linkedin,
  Mail,
  PenTool,
  Sparkles,
  Terminal,
  Users,
} from 'lucide-react'

import {
  activities,
  certificates,
  experience,
  projects,
  skillGroups,
} from '@/lib/portfolio-content'

import {
  ActivityExhibit,
  CertificateExhibit,
  ProjectCard,
} from './portfolio-exhibits'

function Chapter({
  number,
  title,
}: {
  number: string
  title: string
}) {
  return (
    <div className="chapter-label font-mono">
      <span>{number}</span>
      <span className="chapter-line" />
      {title}
    </div>
  )
}

function Destination({
  name,
  next,
}: {
  name: string
  next: string
}) {
  return (
    <div className="scene-caption font-mono">
      <span className="status-dot" />
      {name} DISTRICT
      <span>NEXT / {next}</span>
    </div>
  )
}

const skillIcons = {
  code: Braces,
  web: Globe2,
  ai: BrainCircuit,
  data: Database,
  writing: PenTool,
}

export function PortfolioSections() {
  return (
    <>
      <section
        id="about"
        className="journey-section"
        aria-labelledby="about-title"
      >
        <div className="section-panel about-panel">
          <Chapter
            number="01"
            title="THE PERSON BEHIND THE CODE"
          />

          <div className="section-icon">
            <Fingerprint size={30} strokeWidth={1.3} />
          </div>

          <h2 id="about-title">
            Curiosity meets
            <br />
            <span>possibility.</span>
          </h2>

          <p className="section-lead">
            I am a B.Tech student specializing in Artificial Intelligence and
            Machine Learning at Pimpri Chinchwad University, driven by the
            goal of building intelligent systems that solve real-world
            challenges.
          </p>

          <div className="education-summary">
            <GraduationCap size={22} />

            <div>
              <strong>Pimpri Chinchwad University</strong>
              <span>B.Tech · AI &amp; ML · 2024–2028</span>
              <span>CGPA 9.14</span>
            </div>
          </div>

          <div className="bio-block">
            <h3>Engineering with purpose</h3>

            <p>
              With a strong foundation in Python, JavaScript, and Multi-Agent
              Systems, I have successfully led and developed complex projects,
              including FormGuard-Insight—an AI-driven offline data validation
              system—and MediBuddy v2, a healthcare assistant focused on
              medication adherence.
            </p>
          </div>

          <div className="bio-block">
            <h3>Clarity beyond the code</h3>

            <p>
              Beyond engineering, I bring a unique perspective from my
              background as an SEO-focused Content Writer, allowing me to
              bridge the gap between complex technical logic and clear,
              engaging communication.
            </p>
          </div>

          <div className="bio-block">
            <h3>Always moving forward</h3>

            <p>
              Holding certifications from Google, Meta, and Oracle, I am
              committed to continuous learning in Generative AI and Cloud
              Infrastructure, always seeking opportunities to contribute to
              the global AI ecosystem.
            </p>
          </div>

          <div className="identity-grid">
            <div>
              <BrainCircuit size={20} />
              <span>AI &amp; ML</span>
            </div>

            <div>
              <Braces size={20} />
              <span>Engineering</span>
            </div>

            <div>
              <Sparkles size={20} />
              <span>Problem solving</span>
            </div>
          </div>

          <a className="text-link" href="/resume.pdf" download>
            Download resume
            <Download size={17} />
          </a>
        </div>

        <Destination name="ABOUT" next="SKILLS" />
      </section>

      <section
        id="skills"
        className="journey-section"
        aria-labelledby="skills-title"
      >
        <div className="section-panel">
          <Chapter
            number="02"
            title="THE TECHNOLOGY DISTRICT"
          />

          <div className="section-icon">
            <Terminal size={30} strokeWidth={1.3} />
          </div>

          <h2 id="skills-title">
            The tools.
            <br />
            <span>The thinking.</span>
          </h2>

          <p className="muted-copy">
            A growing toolkit for intelligent systems, thoughtful interfaces,
            and clear communication.
          </p>

          <div className="skills-groups">
            {skillGroups.map((group) => {
              const Icon = skillIcons[group.kind]

              return (
                <div className="skill-group" key={group.title}>
                  <h3>
                    <Icon size={20} strokeWidth={1.5} />
                    {group.title}
                  </h3>

                  <ul className="technology-list">
                    {group.skills.map((skill) => (
                      <li key={skill}>
                        <Icon
                          size={15}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <a className="text-link" href="#projects">
            Visit the project district
            <ArrowUpRight size={17} />
          </a>
        </div>

        <Destination
          name="SKILLS"
          next="PROJECTS"
        />
      </section>

      <section
        id="projects"
        className="journey-section projects-section"
        aria-labelledby="projects-title"
      >
        <div className="projects-panel">
          <Chapter
            number="03"
            title="IDEAS, BUILT INTO REALITY"
          />

          <div className="projects-heading">
            <div>
              <h2 id="projects-title">
                The project <span>district.</span>
              </h2>

              <p className="muted-copy">
                From offline intelligence to healthcare and computer vision.
              </p>
            </div>

            <Layers3 size={30} strokeWidth={1} />
          </div>

          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        </div>

        <Destination
          name="PROJECTS"
          next="EXPERIENCE"
        />
      </section>

      <section
        id="experience"
        className="journey-section"
        aria-labelledby="experience-title"
      >
        <div className="section-panel">
          <Chapter
            number="04"
            title="THE CAREER TOWER"
          />

          <div className="section-icon">
            <BriefcaseBusiness size={30} strokeWidth={1.3} />
          </div>

          <h2 id="experience-title">
            Built on
            <br />
            <span>experience.</span>
          </h2>

          <div className="experience-list">
            {experience.map((role) => (
              <article
                key={role.role}
                className="experience-entry"
              >
                <span className="small-label font-mono">
                  {role.date}
                </span>

                <h3>{role.role}</h3>

                <strong>{role.organization}</strong>

                {role.details.map((detail) => (
                  <p
                    className="muted-copy"
                    key={detail}
                  >
                    {detail}
                  </p>
                ))}
              </article>
            ))}

            <article className="experience-entry">
              <span className="small-label font-mono">
                COMMUNITY RESPONSIBILITY
              </span>

              <h3>Technical Team Member</h3>

              <strong>
                AI &amp; ML Student Volunteer Club · PCU
              </strong>

              <p className="muted-copy">
                Organized technical workshops and coding sessions,
                assisted in hackathons and AI-related events, and
                collaborated with team members to promote technical
                learning.
              </p>
            </article>
          </div>

          <a className="text-link" href="#certificates">
            Continue the journey
            <ArrowDown size={16} />
          </a>
        </div>

        <Destination
          name="EXPERIENCE"
          next="CERTIFICATES"
        />
      </section>

      <section
        id="certificates"
        className="journey-section"
        aria-labelledby="certificates-title"
      >
        <div className="projects-panel">
          <Chapter
            number="05"
            title="THE LEARNING ARCHIVE"
          />

          <div className="projects-heading">
            <div>
              <h2 id="certificates-title">
                Always learning.
                <br />
                <span>Always evolving.</span>
              </h2>

              <p className="muted-copy">
                Six certifications from my resume. An archive of
                continued learning.
              </p>
            </div>

            <FileBadge2 size={30} strokeWidth={1.3} />
          </div>

          <div className="certificates-grid">
            {certificates.map((certificate) => (
              <CertificateExhibit
                key={certificate.id}
                certificate={certificate}
              />
            ))}
          </div>

          <a className="text-link" href="#others">
            Explore beyond the classroom
            <ArrowDown size={16} />
          </a>
        </div>

        <Destination
          name="CERTIFICATES"
          next="OTHERS"
        />
      </section>

      <section
        id="others"
        className="journey-section others-section"
        aria-labelledby="others-title"
      >
        <div className="others-panel">
          <Chapter
            number="06"
            title="THE EXPERIENCE PAVILION"
          />

          <div className="projects-heading">
            <div>
              <span className="small-label font-mono">
                OTHERS
              </span>

              <h2 id="others-title">
                Beyond the
                <br />
                <span>classroom.</span>
              </h2>

              <p className="muted-copy">
                Communities, shared discoveries, and moments that
                shape the way I build.
              </p>
            </div>

            <Users size={30} strokeWidth={1.3} />
          </div>

          <div className="activity-exhibits">
            {activities.map((activity) => (
              <ActivityExhibit
                key={activity.id}
                activity={activity}
              />
            ))}
          </div>

          <a className="text-link" href="#contact">
            One more destination
            <ArrowUpRight size={17} />
          </a>
        </div>

        <Destination
          name="OTHERS"
          next="CONTACT"
        />
      </section>

      <section
        id="contact"
        className="journey-section contact-section"
        aria-labelledby="contact-title"
      >
        <div className="section-panel">
          <Chapter
            number="07"
            title="THE COMMUNICATION TOWER"
          />

          <div className="section-icon">
            <Mail size={30} strokeWidth={1.3} />
          </div>

          <span className="small-label font-mono">
            GET IN TOUCH
          </span>

          <h2 id="contact-title">
            Let&apos;s build
            <br />
            something
            <br />
            <span>meaningful.</span>
          </h2>

          <p className="section-lead">
            Great things start with a conversation.
          </p>

          <a
            className="text-link contact-email"
            href="mailto:piyushvarule15@gmail.com"
          >
            piyushvarule15@gmail.com
            <ArrowUpRight size={16} />
          </a>

          <a
            className="text-link"
            href="/resume.pdf"
            download
          >
            Download resume
            <Download size={16} />
          </a>

          {/* Social / Professional Profiles */}
          <div className="social-links">
            <a
              className="text-link"
              href="https://www.linkedin.com/in/piyush-bipin-varule-04670932b/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
              <Linkedin size={16} />
            </a>

            <a
              className="text-link"
              href="https://github.com/PIYUSH2006-NDA"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
              <Github size={16} />
            </a>
          </div>

          <a
            className="text-link"
            href="#home"
          >
            Back to the city
            <ArrowUpRight size={16} />
          </a>
        </div>

        <Destination
          name="CONTACT"
          next="YOUR NEXT IDEA"
        />
      </section>

      <footer className="site-footer">
        <a
          href="#home"
          className="wordmark"
        >
          P<span>.</span>
        </a>

        <span>
          PIYUSH.DEV{' '}
          <span className="footer-divider">
            /
          </span>{' '}
          Built with intention.
        </span>

        <a href="#home">
          Back to top
          <ArrowUpRight size={16} />
        </a>
      </footer>
    </>
  )
}
