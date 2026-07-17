import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RacesApi } from 'api/RacesApi'
import { useEffect } from 'react'
import { useSocket } from 'hooks/useSocket'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export function useRaces() {
  const queryClient = useQueryClient()
  const { onRaceUpdated } = useSocket()
  const { t } = useTranslation('common')

  const { data, isLoading, error } = useQuery({
    queryKey: ['races'],
    queryFn: RacesApi.getAll,
  })

  useEffect(() => {
    return onRaceUpdated(() => {
      queryClient.invalidateQueries({ queryKey: ['races'] })
    })
  }, [onRaceUpdated, queryClient])

  const createMutation = useMutation({
    mutationFn: RacesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races'] })
      toast.success(t('success.raceCreated'))
    },
    onError: () => {
      toast.error(t('error.generic'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: RacesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['races'] })
      toast.success(t('success.raceDeleted'))
    },
    onError: () => {
      toast.error(t('error.generic'))
    }
  })

  return {
    races: data?.races ?? [],
    count: data?.count ?? 0,
    limit: data?.limit ?? 100,
    isLoading,
    error,
    createRace: createMutation.mutate,
    deleteRace: deleteMutation.mutate,
  }
}
