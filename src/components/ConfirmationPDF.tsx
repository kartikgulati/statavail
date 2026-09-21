import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Submission, Store } from '@prisma/client';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    marginBottom: 12,
  },
  agreementBox: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    border: '1pt solid #ddd',
    marginBottom: 20,
    fontSize: 10,
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 30,
    borderTop: '1pt solid #ddd',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signature: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default function ConfirmationPDF({ submission, store }: { submission: Submission, store: Store }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Availability Confirmation</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Employee Name</Text>
          <Text style={styles.value}>{submission.name}</Text>

          <Text style={styles.label}>Store</Text>
          <Text style={styles.value}>{store.number} - {store.name}</Text>

          <Text style={styles.label}>Availability</Text>
          <Text style={styles.value}>
            {submission.allDay ? 'Available All Day' : `${submission.startTime} to ${submission.endTime}`}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Agreement</Text>
          <View style={styles.agreementBox}>
            <Text>Statutory Holiday Agreement</Text>
            <Text style={{ marginTop: 4 }}>
              I hereby confirm my availability to work on the upcoming statutory holiday. I understand that this submission is provided for scheduling purposes and does not guarantee a specific shift, position, or number of hours.
            </Text>
            <Text style={{ marginTop: 4 }}>
               I acknowledge that my availability may be subject to change based on business needs, operational requirements, and staffing levels.
            </Text>
            <Text style={{ marginTop: 4 }}>
               This availability submission applies only to the upcoming statutory holiday and does not modify or replace my regular availability.
            </Text>
            <Text style={{ marginTop: 4 }}>
                I agree to notify my Store Manager or Department Manager as soon as possible should my availability change.
            </Text>
               <Text style={{ marginTop: 4 }}>
                By signing below, I certify that the information provided is accurate and I agree to the terms
                of the holiday scheduling policy.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.label}>Digital Signature</Text>
            <Text style={styles.signature}>{submission.signatureName}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.label}>Timestamp</Text>
            <Text style={styles.value}>{format(new Date(submission.agreedAt), 'MM/dd/yyyy h:mm a')}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
