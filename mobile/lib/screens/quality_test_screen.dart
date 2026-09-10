import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../services/quality_service.dart';

class QualityTestScreen extends StatefulWidget {
  final String batchId;

  const QualityTestScreen({super.key, required this.batchId});

  @override
  State<QualityTestScreen> createState() => _QualityTestScreenState();
}

class _QualityTestScreenState extends State<QualityTestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _moistureController = TextEditingController(text: '17.5');
  final _phController = TextEditingController(text: '3.8');
  final _hmfController = TextEditingController(text: '12.4');
  final _c4SugarsController = TextEditingController(text: '1.2');
  final _colorController = TextEditingController(text: 'AMBER');
  final _notesController = TextEditingController();

  String _selectedResult = 'PASS';
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void dispose() {
    _moistureController.dispose();
    _phController.dispose();
    _hmfController.dispose();
    _c4SugarsController.dispose();
    _colorController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submitQualityTest() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      final hmfVal = double.tryParse(_hmfController.text);
      final c4Val = double.tryParse(_c4SugarsController.text);

      String noteText = _notesController.text.trim();
      if (hmfVal != null || c4Val != null) {
        final extras = <String>[];
        if (hmfVal != null) extras.add('HMF: $hmfVal mg/kg');
        if (c4Val != null) extras.add('C4 Sugars: ${c4Val}%');
        final extraStr = '[Lab Metrics: ${extras.join(", ")}]';
        noteText = noteText.isEmpty ? extraStr : '$noteText | $extraStr';
      }

      final req = {
        'moisture': double.tryParse(_moistureController.text),
        'ph': double.tryParse(_phController.text),
        'color': _colorController.text.trim(),
        'result': _selectedResult,
        'notes': noteText,
      };

      await QualityService.addQualityTest(widget.batchId, req);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Quality Test logged successfully!'),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Quality Testing — ${widget.batchId}'),
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

              const Text('Enter Laboratory Analysis Data', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 16),

              TextFormField(
                controller: _moistureController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Moisture Content (%)',
                  hintText: 'e.g. 17.5',
                  prefixIcon: Icon(Icons.water_drop_outlined),
                ),
                validator: (v) {
                  if (v != null && v.isNotEmpty && double.tryParse(v) == null) {
                    return 'Please enter a valid decimal number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _phController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'pH Level',
                  hintText: 'e.g. 3.8',
                  prefixIcon: Icon(Icons.science_outlined),
                ),
                validator: (v) {
                  if (v != null && v.isNotEmpty && double.tryParse(v) == null) {
                    return 'Please enter a valid decimal number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _hmfController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'HMF (mg/kg)',
                        hintText: 'e.g. 12.4',
                        prefixIcon: Icon(Icons.analytics_outlined),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _c4SugarsController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        labelText: 'C4 Sugars (%)',
                        hintText: 'e.g. 1.2',
                        prefixIcon: Icon(Icons.biotech_outlined),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _colorController,
                decoration: const InputDecoration(
                  labelText: 'Color Grade',
                  hintText: 'e.g. AMBER / DARK AMBER / LIGHT',
                  prefixIcon: Icon(Icons.color_lens_outlined),
                ),
              ),
              const SizedBox(height: 14),

              DropdownButtonFormField<String>(
                initialValue: _selectedResult,
                decoration: const InputDecoration(
                  labelText: 'Test Verdict / Result',
                  prefixIcon: Icon(Icons.verified_outlined),
                ),
                items: const [
                  DropdownMenuItem(value: 'PASS', child: Text('PASS — Compliant')),
                  DropdownMenuItem(value: 'FAIL', child: Text('FAIL — Non-compliant')),
                  DropdownMenuItem(value: 'REQUIRES_REVIEW', child: Text('REQUIRES REVIEW')),
                  DropdownMenuItem(value: 'PENDING', child: Text('PENDING FURTHER LAB TESTS')),
                ],
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _selectedResult = val;
                    });
                  }
                },
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _notesController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Inspector Notes & Observations',
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _submitQualityTest,
                  icon: const Icon(Icons.check_circle_outline),
                  label: _isSubmitting
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('SUBMIT QUALITY TEST'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
