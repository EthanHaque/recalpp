# Generated by Django 4.1.8 on 2023-04-22 08:05

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("data_ingestion", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="course",
            name="crosslistings_string",
        ),
        migrations.RemoveField(
            model_name="course",
            name="distribution_areas",
        ),
    ]
