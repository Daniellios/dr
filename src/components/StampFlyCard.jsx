export default function StampFlyCard({
  className = "",
  variant = "cream",
  tiltDeg = 0,
  image = null,
  imageAlt = "",
  imageSize = "cover",
  imagePosition = "center",
  imageBg = undefined,
  scaleW = 1,
  scaleH = 1,
  children
}) {
  const w = Math.max(1, scaleW);
  const h = Math.max(1, scaleH);

  return (
    <article
      className={`stamp-fly${className ? ` ${className}` : ""}`}
      style={{ "--tilt": `${tiltDeg}deg`, "--card-w-scale": w, "--card-h-scale": h }}
    >
      <div className="stamp-fly-frame">
        <div
          className={`stamp-fly-field stamp-fly-field--${variant}${
            image ? " stamp-fly-field--photo" : ""
          }`}
        >
          <div className="stamp-fly-grain" aria-hidden="true" />
          {image ? (
            <>
              <div
                className="stamp-fly-photo"
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundSize: imageSize,
                  backgroundPosition: imagePosition,
                  backgroundColor: imageBg
                }}
                role="img"
                aria-label={imageAlt || undefined}
              />
              <div className="stamp-fly-photo-soften" aria-hidden="true" />
              <div className="stamp-fly-photo-riso" aria-hidden="true" />
            </>
          ) : null}
          {children ? <div className="stamp-fly-content">{children}</div> : null}
        </div>
      </div>
    </article>
  );
}
