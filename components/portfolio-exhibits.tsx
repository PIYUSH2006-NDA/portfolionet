'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ImageIcon,
  MapPin,
} from 'lucide-react'

import type {
  Activity,
  Certificate,
  PortfolioImage,
  Project,
} from '@/lib/portfolio-content'


/* =========================================================
   IMAGE AREA
========================================================= */

export function ImageArea({
  image,
  label,
}: {
  image: PortfolioImage
  label: string
}) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="exhibit-image">
      {image.src && !failed ? (
        <img
          src={image.src}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="blank-image"
          role="img"
          aria-label={`${label}: image to be added`}
        >
          <ImageIcon
            size={26}
            strokeWidth={1}
            aria-hidden="true"
          />

          <span>
            {image.src
              ? 'Image unavailable'
              : label}
          </span>

          <span className="image-placeholder-note">
            {image.src
              ? 'Please check the image path'
              : 'Image to be added'}
          </span>
        </div>
      )}
    </div>
  )
}


/* =========================================================
   PROJECT CARD
========================================================= */

export function ProjectCard({
  project,
}: {
  project: Project
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <article className="project-card">

      <ImageArea
        key={project.image.src}
        image={project.image}
        label="Project image"
      />

      <div className="project-body">

        <span className="small-label font-mono">
          {project.category}
        </span>

        <h3>{project.name}</h3>

        <p className="muted-copy">
          {project.description}
        </p>

        <button
          type="button"
          className="project-more"
          aria-expanded={expanded}
          aria-controls={`project-${project.id}`}
          onClick={() =>
            setExpanded((value) => !value)
          }
        >
          <strong>
            {expanded ? 'LESS' : 'MORE'}
          </strong>

          <ChevronDown
            size={16}
            className={
              expanded ? 'rotate-180' : ''
            }
          />
        </button>

        <div
          className="expandable-detail"
          data-open={expanded}
          id={`project-${project.id}`}
          aria-hidden={!expanded}
        >
          {expanded && (
            <div className="project-detail">

              {project.details.length > 0 ? (
                project.details.map((detail) => (
                  <p key={detail}>
                    {detail}
                  </p>
                ))
              ) : (
                <p>
                  Additional project details will
                  be added here.
                </p>
              )}

              {project.technologies.length > 0 && (
                <ul
                  className="technology-list"
                  aria-label="Technologies"
                >
                  {project.technologies.map(
                    (technology) => (
                      <li key={technology}>
                        {technology}
                      </li>
                    )
                  )}
                </ul>
              )}

              {project.url && (
                <a
                  className="text-link"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View project
                  <ArrowUpRight size={16} />
                </a>
              )}

            </div>
          )}
        </div>

      </div>
    </article>
  )
}


/* =========================================================
   CERTIFICATE EXHIBIT
========================================================= */

export function CertificateExhibit({
  certificate,
}: {
  certificate: Certificate
}) {
  return (
    <article className="certificate-exhibit">

      <ImageArea
        key={certificate.image.src}
        image={certificate.image}
        label="Certificate image"
      />

      <div className="certificate-body">

        <span className="small-label font-mono">
          {certificate.issuer ||
            'Issuer to be added'}
        </span>

        <h3>{certificate.title}</h3>

        {certificate.url && (
          <a
            href={certificate.url}
            className="text-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            View credential
            <ArrowUpRight size={16} />
          </a>
        )}

      </div>
    </article>
  )
}


/* =========================================================
   ACTIVITY / OTHERS EXHIBIT
========================================================= */

export function ActivityExhibit({
  activity,
}: {
  activity: Activity
}) {
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const images = activity.images ?? []
  const hasImages = images.length > 0
  const currentImage = images[index]

  const hasMoreContent =
    activity.description.length > 1 ||
    activity.highlights.length > 0

  const nextImage = () => {
    if (!hasImages) {
      return
    }

    setIndex((current) =>
      (current + 1) % images.length
    )
  }

  const previousImage = () => {
    if (!hasImages) {
      return
    }

    setIndex((current) =>
      (current - 1 + images.length) %
      images.length
    )
  }

  return (
    <article
      className={`activity-exhibit ${expanded ? 'is-expanded' : ''
        }`}
    >

      {/* =====================================================
         IMAGE SIDE
      ===================================================== */}

      <div className="activity-gallery">

        <div
          role="group"
          aria-label={`Images for ${activity.title}`}
        >

          <div className="exhibit-image">

            {currentImage?.src ? (
              <img
                src={currentImage.src}
                alt={currentImage.alt}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div
                className="blank-image"
                role="img"
                aria-label={`${activity.title}: image to be added`}
              >
                <ImageIcon
                  size={28}
                  strokeWidth={1}
                  aria-hidden="true"
                />

                <span>
                  Image coming soon
                </span>

                <span className="image-placeholder-note">
                  Image to be added
                </span>
              </div>
            )}

          </div>


          {/* =================================================
             CAROUSEL CONTROLS
          ================================================= */}

          {hasImages && images.length > 1 && (
            <div className="carousel-controls">

              <button
                type="button"
                onClick={previousImage}
                aria-label="Previous image"
              >
                <ArrowLeft size={17} />
                <span>Previous</span>
              </button>

              <span>
                {String(index + 1).padStart(2, '0')}
                {' / '}
                {String(images.length).padStart(2, '0')}
              </span>

              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
              >
                <span>Next</span>
                <ArrowRight size={17} />
              </button>

            </div>
          )}

        </div>

      </div>


      {/* =====================================================
         CONTENT SIDE
      ===================================================== */}

      <div className="activity-copy">

        <div className="chapter-label font-mono">
          <span>
            {activity.category}
          </span>
        </div>


        <h3>
          {activity.title}
        </h3>


        {/* =================================================
           EVENT META
        ================================================= */}

        <div className="event-meta">

          {activity.location && (
            <span>
              <MapPin size={17} />
              {activity.location}
            </span>
          )}

          {activity.date && (
            <span>
              <CalendarDays size={17} />
              {activity.date}
            </span>
          )}

        </div>


        {/* =================================================
           FIRST / PREVIEW DESCRIPTION
        ================================================= */}

        {activity.description[0] && (
          <p className="content-note">
            {activity.description[0]}
          </p>
        )}


        {/* =================================================
           MORE / LESS BUTTON
        ================================================= */}

        {hasMoreContent && (
          <button
            type="button"
            className="activity-more"
            onClick={() =>
              setExpanded((value) => !value)
            }
            aria-expanded={expanded}
            aria-controls={`activity-details-${activity.id}`}
          >

            <span>
              {expanded ? 'LESS' : 'MORE'}
            </span>

            <ChevronDown
              size={17}
              className={
                expanded
                  ? 'activity-more-icon is-open'
                  : 'activity-more-icon'
              }
            />

          </button>
        )}


        {/* =================================================
           EXPANDED CONTENT

           IMPORTANT:
           This is INSIDE activity-copy.
           Therefore it expands downward on the RIGHT
           without creating a blank area below the image.
        ================================================= */}

        {expanded && hasMoreContent && (
          <div
            id={`activity-details-${activity.id}`}
            className="activity-expanded-content"
          >

            {/* Remaining descriptions */}
            {activity.description
              .slice(1)
              .map(
                (
                  paragraph,
                  paragraphIndex
                ) => (
                  <p
                    key={`${activity.id}-description-${paragraphIndex}`}
                    className="content-note"
                  >
                    {paragraph}
                  </p>
                )
              )}


            {/* Highlights */}
            {activity.highlights.length > 0 && (
              <div className="activity-highlights">

                {activity.highlights.map(
                  (highlight) => (
                    <span
                      key={`${activity.id}-${highlight}`}
                    >
                      {highlight}
                    </span>
                  )
                )}

              </div>
            )}

          </div>
        )}

      </div>

    </article>
  )
}