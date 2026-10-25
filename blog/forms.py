from django import forms


class ContactForm(forms.Form):
    name = forms.CharField(
        max_length=120,
        label="Ismingiz",
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Ismingiz"}
        ),
    )
    email = forms.EmailField(
        label="Email",
        widget=forms.EmailInput(
            attrs={"class": "form-control", "placeholder": "example@email.com"}
        ),
    )
    subject = forms.CharField(
        max_length=200,
        label="Mavzu",
        widget=forms.TextInput(
            attrs={"class": "form-control", "placeholder": "Mavzu"}
        ),
    )
    message = forms.CharField(
        label="Xabar",
        widget=forms.Textarea(
            attrs={
                "class": "form-control",
                "rows": 8,
                "placeholder": "Xabaringizni yozing",
            }
        ),
    )
