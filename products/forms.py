from django import forms

from .models import Order


class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = [
            "full_name",
            "email",
            "phone",
            "address",
            "city",
            "note",
            "payment_method",
        ]
        labels = {
            "full_name": "Ism va familiya",
            "email": "Email",
            "phone": "Telefon",
            "address": "Manzil",
            "city": "Shahar",
            "note": "Qo'shimcha izoh",
            "payment_method": "To'lov usuli",
        }
        widgets = {
            "full_name": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Ism va familiya"}
            ),
            "email": forms.EmailInput(
                attrs={"class": "form-control", "placeholder": "example@email.com"}
            ),
            "phone": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "+998 90 123 45 67"}
            ),
            "address": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 3,
                    "placeholder": "Ko'cha, uy, xonadon",
                }
            ),
            "city": forms.TextInput(
                attrs={"class": "form-control", "placeholder": "Toshkent"}
            ),
            "note": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 3,
                    "placeholder": "Kuryer uchun izoh (ixtiyoriy)",
                }
            ),
            "payment_method": forms.Select(attrs={"class": "custom-select"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["note"].required = False
        self.fields["city"].required = False
