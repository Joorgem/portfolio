import { useState, FormEvent, ChangeEvent } from "react";
import emailjs from "@emailjs/browser";
import Alert from "../components/Alert";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

type AlertType = "danger" | "success";

const Contact: React.FC = () => {
  const { t } = useTranslation('contact');
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertType, setAlertType] = useState<AlertType>("success");
  const [alertMessage, setAlertMessage] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showAlertMessage = (type: AlertType, message: string) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("From submitted:", formData);
      await emailjs.send(
        "service_ea205oa",
        "template_o2y5538",
        {
          from_name: formData.name,
          to_name: "Jorge",
          from_email: formData.email,
          to_email: "contato@jorgemolina.dev",
          message: formData.message,
        },
        "i2duMx6NvyyeZvrwf"
      );
      setIsLoading(false);
      setFormData({ name: "", email: "", message: "" });
      showAlertMessage("success", t('form.successMessage'));
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      showAlertMessage("danger", t('form.errorMessage'));
    }
  };

  return (
    <section className="relative bg-transparent w-full min-h-screen">{/* Particles inherit from Hero background */}
      
      {/* Layout Unificado - Header + Formulário */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen py-20 px-4">
        
        {/* Header Compacto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              {t('title')}
            </span>
          </h2>
          
          <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed mb-8">
            {t('description')}
          </p>
          
          {/* Ícones Sociais Minimalistas */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <motion.a
              href="https://www.linkedin.com/in/jorge-molina-539394197/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('social.linkedin')}
              title={t('social.linkedin')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 border border-white/10 rounded-full hover:border-white/30 transition-all duration-300 hover:bg-white/5"
            >
              <Linkedin size={20} className="text-gray-300 hover:text-white transition-colors duration-300" />
            </motion.a>
            
            <motion.a
              href="https://github.com/Joorgem"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('social.github')}
              title={t('social.github')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 border border-white/10 rounded-full hover:border-white/30 transition-all duration-300 hover:bg-white/5"
            >
              <Github size={20} className="text-gray-300 hover:text-white transition-colors duration-300" />
            </motion.a>
            
            <motion.a
              href="mailto:contato@jorgemolina.dev"
              aria-label={t('social.email')}
              title={t('social.email')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 border border-white/10 rounded-full hover:border-white/30 transition-all duration-300 hover:bg-white/5"
            >
              <Mail size={20} className="text-gray-300 hover:text-white transition-colors duration-300" />
            </motion.a>
          </div>
        </motion.div>

        {/* Formulário Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          {showAlert && <Alert type={alertType} text={alertMessage} />}
          <div className="flex flex-col items-center justify-center p-8 mx-auto border border-white/10 rounded-2xl bg-black/30 backdrop-blur-sm">
            <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="name" className="feild-label">
              {t('form.fields.name')}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="field-input field-input-focus"
              placeholder=""
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="email" className="feild-label">
              {t('form.fields.email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="field-input field-input-focus"
              placeholder=""
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-5">
            <label htmlFor="message" className="feild-label">
              {t('form.fields.message')}
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="field-input field-input-focus"
              placeholder=""
              autoComplete="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
            <button
              type="submit"
              className="w-full px-1 py-3 text-lg text-center rounded-md cursor-pointer bg-gradient-to-r from-neutral-800 to-neutral-700 border border-white/10 hover:from-neutral-700 hover:to-neutral-600 hover:border-white/20 transition-all duration-300 hover-animation"
            >
              {!isLoading ? t('form.submit') : t('form.sending')}
            </button>
            </form>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
};

export default Contact;