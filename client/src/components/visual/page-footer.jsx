import { FaLinkedin } from "react-icons/fa";

function PageFooter({ children, className = "" }) {
  return (
    <div
      className={`${className} absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-center text-gray-400 text-sm`}
    >
      <p>{children}</p>
      <a
        href="https://www.linkedin.com/in/jana-kotrbat%C3%A1-b51329141/"
        target="_blank"
        rel="noopener noreferrer"
        className="!text-blue-500 hover:!text-cyan-400"
      >
        <FaLinkedin size={16} />
      </a>
    </div>
  );
}

export default PageFooter;
