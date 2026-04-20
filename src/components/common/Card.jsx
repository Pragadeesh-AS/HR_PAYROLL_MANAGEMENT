import React from "react";
import "./Card.css";

const Card = ({
  children,
  variant = "default",
  hover = true,
  className = "",
  onClick,
}) => {
  const cardClass = `
    card 
    card-${variant} 
    ${hover ? "card-hover" : ""}
    ${onClick ? "card-clickable" : ""}
    ${className}
  `.trim();

  return (
    <div className={cardClass} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "" }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = "" }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);

export default Card;
