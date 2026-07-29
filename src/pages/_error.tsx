import React from "react";
import Link from "next/link";
import { NextPageContext } from "next";

function CustomError({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0d0d0d",
      color: "#ffffff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      padding: "24px",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "400px",
        backgroundColor: "#161616",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "32px",
        borderRadius: "24px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
      }}>
        <h1 style={{ fontSize: "2rem", color: "#b08d4b", marginBottom: "8px" }}>
          {statusCode ? `Error ${statusCode}` : "Application Error"}
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#888888", marginBottom: "20px" }}>
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : "An unexpected error occurred on client"}
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#b08d4b",
            color: "#000000",
            fontWeight: "bold",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            borderRadius: "9999px",
            textDecoration: "none"
          }}
        >
          Return to Studio Home
        </Link>
      </div>
    </div>
  );
}

CustomError.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;
