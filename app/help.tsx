import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { 
  ArrowLeft, 
  CircleHelp as HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  ChevronRight,
  ChevronDown,
  Send,
  ExternalLink
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function HelpScreen() {
  const { user } = useAuth();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });
  const [showContactForm, setShowContactForm] = useState(false);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: '¿Cómo puedo crear una solicitud de envío?',
      answer: 'Para crear un envío, ve a la pantalla principal y toca el botón "Nuevo Envío". Completa la información de recogida, entrega y detalles del paquete. Una vez creado, los repartidores podrán ver tu solicitud en el mapa.',
      category: 'general'
    },
    {
      id: '2',
      question: '¿Cómo funciona el sistema de precios?',
      answer: 'Los precios se calculan automáticamente basándose en la distancia, tipo de paquete y demanda actual. El precio se muestra antes de confirmar tu solicitud y no cambiará una vez aceptada por un repartidor.',
      category: 'general'
    },
    {
      id: '3',
      question: '¿Qué hago si mi paquete no llega?',
      answer: 'Si tu paquete no llega en el tiempo estimado, puedes contactar directamente al repartidor a través de la aplicación o reportar el problema desde la sección de ayuda. Nuestro equipo de soporte te ayudará a resolver la situación.',
      category: 'problems'
    },
    {
      id: '4',
      question: '¿Cómo me convierto en repartidor?',
      answer: 'Para ser repartidor, regístrate seleccionando "Repartidor" durante el proceso de registro. Necesitarás proporcionar información sobre tu vehículo y pasar por un proceso de verificación. Una vez aprobado, podrás ver y aceptar entregas.',
      category: 'delivery'
    },
    {
      id: '5',
      question: '¿Cómo se calculan las calificaciones?',
      answer: 'Las calificaciones se basan en las valoraciones de los usuarios después de cada entrega completada. Se considera la puntualidad, cuidado del paquete y profesionalidad. Las calificaciones ayudan a mantener la calidad del servicio.',
      category: 'delivery'
    },
    {
      id: '6',
      question: '¿Qué tipos de paquetes puedo enviar?',
      answer: 'Puedes enviar documentos, paquetes pequeños y medianos, comida, y otros artículos legales. No se permiten artículos peligrosos, ilegales o de gran valor sin declarar. Consulta nuestros términos para más detalles.',
      category: 'general'
    },
  ];

  const contactOptions = [
    {
      title: 'Chat en Vivo',
      description: 'Habla con nuestro equipo de soporte',
      icon: MessageCircle,
      action: () => router.push('/chat?supportTicket=new'),
    },
    {
      title: 'Llamar Soporte',
      description: '+34 900 123 456',
      icon: Phone,
      action: () => Linking.openURL('tel:+34900123456'),
    },
    {
      title: 'Enviar Email',
      description: 'soporte@deliveryapp.com',
      icon: Mail,
      action: () => Linking.openURL('mailto:soporte@deliveryapp.com'),
    },
  ];

  const handleFAQToggle = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleSendMessage = () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    Alert.alert(
      'Mensaje Enviado',
      'Tu mensaje ha sido enviado. Nuestro equipo te responderá en las próximas 24 horas.',
      [
        {
          text: 'OK',
          onPress: () => {
            setContactForm({ subject: '', message: '' });
            setShowContactForm(false);
          }
        }
      ]
    );
  };

  const renderFAQ = (faq: FAQ) => (
    <View key={faq.id} style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={() => handleFAQToggle(faq.id)}
      >
        <Text style={styles.faqQuestionText}>{faq.question}</Text>
        {expandedFAQ === faq.id ? (
          <ChevronDown size={20} color="#6B7280" />
        ) : (
          <ChevronRight size={20} color="#6B7280" />
        )}
      </TouchableOpacity>
      {expandedFAQ === faq.id && (
        <View style={styles.faqAnswer}>
          <Text style={styles.faqAnswerText}>{faq.answer}</Text>
        </View>
      )}
    </View>
  );

  return (
    <AuthGuard>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Ayuda y Soporte',
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Quick Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto Rápido</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={option.action}
              >
                <View style={styles.contactIcon}>
                  <option.icon size={24} color="#2563EB" />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
          <View style={styles.faqContainer}>
            {faqs.map(renderFAQ)}
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.contactFormToggle}
            onPress={() => setShowContactForm(!showContactForm)}
          >
            <Text style={styles.contactFormToggleText}>
              ¿No encuentras lo que buscas? Contáctanos
            </Text>
            {showContactForm ? (
              <ChevronDown size={20} color="#2563EB" />
            ) : (
              <ChevronRight size={20} color="#2563EB" />
            )}
          </TouchableOpacity>

          {showContactForm && (
            <View style={styles.contactForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Asunto</Text>
                <TextInput
                  style={styles.input}
                  value={contactForm.subject}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, subject: text }))}
                  placeholder="Describe brevemente tu consulta"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mensaje</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={contactForm.message}
                  onChangeText={(text) => setContactForm(prev => ({ ...prev, message: text }))}
                  placeholder="Describe tu problema o consulta en detalle..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Send size={20} color="#FFFFFF" />
                <Text style={styles.sendButtonText}>Enviar Mensaje</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recursos Adicionales</Text>
          <View style={styles.resourcesContainer}>
            <TouchableOpacity style={styles.resourceItem}>
              <Text style={styles.resourceTitle}>Guía de Usuario</Text>
              <ExternalLink size={16} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.resourceItem}>
              <Text style={styles.resourceTitle}>Términos de Servicio</Text>
              <ExternalLink size={16} color="#6B7280" />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.resourceItem}>
              <Text style={styles.resourceTitle}>Política de Privacidad</Text>
              <ExternalLink size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Necesitas ayuda urgente? Llama al +34 900 123 456
          </Text>
        </View>
      </ScrollView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  faqContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  contactFormToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  contactFormToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2563EB',
  },
  contactForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resourcesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  resourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resourceTitle: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});