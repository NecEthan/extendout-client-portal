import { formatDate } from "@/lib/formatDate";
import type { ProjectPhoto } from "@/interfaces/project-photo-interface";

export function PhotoGrid({ photos }: { photos: ProjectPhoto[] }) {
  if (photos.length === 0) {
    return <p className="text-sm text-muted-foreground">No photos yet.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {photos.map((photo) => (
        <li key={photo.id}>
          <figure className="flex flex-col gap-1.5">
            {/* Opens the full-size image in a new tab */}
            <a href={photo.url} target="_blank" rel="noopener noreferrer">
              {/* Plain <img>: presigned bucket URLs change on every fetch, which next/image can't optimise */}
              <img
                src={photo.url}
                alt={photo.fileName}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg bg-muted object-cover"
              />
            </a>
            <figcaption className="text-xs text-muted-foreground">
              {photo.uploadedBy.name} · {formatDate(photo.createdAt)}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
