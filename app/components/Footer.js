import React, { useEffect } from "react"
import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="border-top text-center small text-muted py-3">
      <p>
        <Link to="/" className="mx-1">
          Home
        </Link>{" "}
        |{" "}
        <Link className="mx-1" to="/about-us">
          About
        </Link>{" "}
        |{" "}
        <Link className="mx-1" to="/portfolio">
          Portfolio
        </Link>
      </p>
      <p className="m-0">
        Copyright&copy; {new Date().getFullYear() + " "}
        <Link to="/" className="text-muted">
          ComplexApp
        </Link>
        . All rights reserved.
      </p>
    </footer>
  )
}

export default Footer
