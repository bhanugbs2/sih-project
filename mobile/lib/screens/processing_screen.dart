import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../services/processing_service.dart';

class ProcessingScreen extends StatefulWidget {
  final String batchId;

  const ProcessingScreen({super.key, required this.batchId});

  @override
  State<ProcessingScreen> createState() => _ProcessingScreenState();
}

class _ProcessingScreenState extends State<ProcessingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _processTypeController = TextEditingController(text: 'FILTERING');
  final _operationController = TextEditingController(text: 'Coarse Mesh Filtration');
  final _operatorController = TextEditingController(text: 'Master Beekeeper');
  final _tempController = TextEditingController(text: '38.0');
  final _descriptionController = TextEditingController();

  bool _isSubmitting = false;
  bool _isMarkingReady = false;
  String? _errorMessage;

  @override
  void dispose() {
    _processTypeController.dispose();
    _operationController.dispose();
    _operatorController.dispose();
    _tempController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submitProcessingRecord() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final req = {
        'processType': _processTypeController.text.trim(),
        'operation': _operationController.text.trim(),
        'operator': _operatorController.text.trim(),
        'processingTemperature': double.tryParse(_tempController.text),
        'tempSource': 'Processing Vessel Temperature Sensor',
        'description': _descriptionController.text.trim(),
      };

      await ProcessingService.addProcessingRecord(widget.batchId, req);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Processing record logged successfully!'),
            backgroundColor: AppTheme.statusSuccess,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isSubmitting = false;
      });
    }
  }

  Future<void> _handleMarkReadyForPackaging() async {
    setState(() {
      _isMarkingReady = true;
      _errorMessage = null;
    });

    try {
      await ProcessingService.markBatchReadyForPackaging(widget.batchId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Batch marked Ready for Packaging!'),
            backgroundColor: AppTheme.statusSuccess,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isMarkingReady = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Honey Processing — ${widget.batchId}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: AppTheme.statusDanger.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(_errorMessage!, style: const TextStyle(color: AppTheme.statusDanger)),
                ),

              const Text('Log Honey Processing Step', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 16),

              TextFormField(
                controller: _processTypeController,
                decoration: const InputDecoration(
                  labelText: 'Process Type',
                  hintText: 'e.g. FILTERING / SETTLING / PASTEURIZATION',
                  prefixIcon: Icon(Icons.precision_manufacturing_outlined),
                ),
                validator: (v) => v == null || v.trim().isEmpty ? 'Please enter process type' : null,
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _operationController,
                decoration: const InputDecoration(
                  labelText: 'Specific Operation',
                  hintText: 'e.g. Coarse Mesh Filtration',
                  prefixIcon: Icon(Icons.build_outlined),
                ),
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _operatorController,
                decoration: const InputDecoration(
                  labelText: 'Operator Name',
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _tempController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Processing Temperature (°C)',
                  hintText: 'e.g. 38.0',
                  helperText: 'Source: Processing Vessel Sensor (Not hive ambient DHT22)',
                  prefixIcon: Icon(Icons.thermostat_outlined),
                ),
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Process Description & Equipment Details',
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _submitProcessingRecord,
                  icon: const Icon(Icons.save_outlined),
                  label: _isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('SAVE PROCESSING RECORD'),
                ),
              ),

              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 10),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _isMarkingReady ? null : _handleMarkReadyForPackaging,
                  icon: const Icon(Icons.check_circle, color: AppTheme.statusSuccess),
                  label: _isMarkingReady
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('MARK READY FOR PACKAGING', style: TextStyle(color: AppTheme.statusSuccess)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppTheme.statusSuccess),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
