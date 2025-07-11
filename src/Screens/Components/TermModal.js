import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';

const TermsModal = ({visible, onClose, onAgree}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Terms & Conditions</Text>

            <Text style={styles.text}>
              {`Welcome to Beingpetz!\n\nBy creating a profile on Beingpetz, you agree to the following terms and conditions:\n
1. Acceptance of Terms\n
By accessing and using Beingpetz, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, you must not create a profile or use the platform.\n
2. Profile Information\n
• You agree to provide accurate, complete, and truthful information during the profile creation process.\n
• Misrepresentation of information may result in suspension or termination of your account.\n
3. Responsible Pet Ownership\n
• By joining Beingpetz, you affirm that you are a responsible pet parent.\n
• You agree to ensure the safety, well-being, and care of your pet at all times.\n
4. Community Guidelines\n
• Respectful communication is expected when interacting with other members.\n
• Harassment, abuse, or discriminatory behavior of any kind is prohibited and may result in immediate removal from the platform.\n
5. Content Sharing\n
• Any photos, videos, or posts shared on Beingpetz must adhere to community standards and must not contain offensive or harmful content.\n
• By sharing content, you grant Beingpetz a non-exclusive, royalty-free license to display your content on the platform.\n
6. Privacy and Data Use\n
• Beingpetz values your privacy and will handle your personal data in accordance with our Privacy Policy.\n
• For details on how your data is collected and used, please review the Privacy Policy.\n
7. Limitation of Liability\n
• Beingpetz is not liable for any disputes or damages arising from interactions with other members on the platform.\n
• Members are solely responsible for their actions and communication within the community.\n
8. Modification of Terms\n
• Beingpetz reserves the right to update or modify these Terms and Conditions at any time.\n
• Continued use of the platform after modifications indicates your acceptance of the revised terms.\n
9. Termination of Account\n
• Beingpetz reserves the right to suspend or terminate accounts for violations of these Terms and Conditions without prior notice.\n
10. Prohibited Content\n
• Sharing content that depicts animal cruelty, nudity, or any form of explicit or harmful material is strictly prohibited.\n
• Violation of this rule may result in immediate suspension or termination of your account.\n
11. Restriction on Sale of Animals & Breeders Participation\n
• No Sale of Animals: Direct pet sales, auctions, or commercial transactions are strictly prohibited. Breeders may facilitate non-commercial adoptions to ensure pets are placed in suitable and caring homes.\n
• Breeder Participation: Beingpetz welcomes ethical breeders who promote responsible pet care and breed preservation. They may share educational insights and connect with the community but cannot engage in financial transactions involving pets.\n

Contact Information\n
For any questions regarding these Terms and Conditions, please contact us at contact@Beingpetz.com\n

By clicking "Agree" and creating your profile, you confirm that you understand and accept the above Terms and Conditions.`}
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                onAgree();
                onClose();
              }}>
              <Text style={styles.closeText}>I Agree</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: screenHeight * 0.8,
    overflow: 'hidden',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#8337B2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TermsModal;
