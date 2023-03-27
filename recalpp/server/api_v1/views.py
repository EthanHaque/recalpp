from django.shortcuts import render
from django.http import JsonResponse

def get_routes(request):

   routes=[
      {
         'Endpoint': '/course/',
         'method': 'GET',
         'body': None,
         'description': 'Returns an array of courses'
      },
      {
         'Endpoint': '/course/id',
         'method': 'GET',
         'body': None,
         'description': 'Returns a single course object'
      }
      ]

   
   return JsonResponse(routes, safe=False)