# Generated by Django 4.1.8 on 2023-05-08 20:53

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("schedule_builder", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="major",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
    ]